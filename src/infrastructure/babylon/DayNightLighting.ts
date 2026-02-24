import { Scene, DirectionalLight, HemisphericLight, Color3, Vector3 } from '@babylonjs/core';
import { EventBus, GameEventType, TimeChangedEvent } from '@application/events/EventBus';

interface ColorSet {
  sky: Color3;
  ambient: Color3;
  sunIntensity: number;
  ambientIntensity: number;
}

const NIGHT: ColorSet = {
  sky: new Color3(0.05, 0.05, 0.15),
  ambient: new Color3(0.1, 0.1, 0.3),
  sunIntensity: 0.1,
  ambientIntensity: 0.3,
};

const DAWN: ColorSet = {
  sky: new Color3(0.8, 0.5, 0.3),
  ambient: new Color3(0.9, 0.6, 0.4),
  sunIntensity: 0.6,
  ambientIntensity: 0.5,
};

const DAY: ColorSet = {
  sky: new Color3(0.5, 0.7, 0.9),
  ambient: new Color3(0.9, 0.9, 0.85),
  sunIntensity: 1.0,
  ambientIntensity: 0.7,
};

const DUSK: ColorSet = {
  sky: new Color3(0.6, 0.3, 0.5),
  ambient: new Color3(0.8, 0.5, 0.3),
  sunIntensity: 0.5,
  ambientIntensity: 0.4,
};

/**
 * Manages Babylon.js scene lighting to reflect the day/night cycle.
 * Subscribes to TIME_CHANGED events from EventBus.
 */
export class DayNightLighting {
  private scene: Scene;
  private sunLight: DirectionalLight;
  private ambientLight: HemisphericLight;

  constructor(scene: Scene, sunLight: DirectionalLight, eventBus: EventBus) {
    this.scene = scene;
    this.sunLight = sunLight;

    const existing = scene.getLightByName('ambientLight') as HemisphericLight | null;
    if (existing) {
      this.ambientLight = existing;
    } else {
      this.ambientLight = new HemisphericLight('ambientLight', new Vector3(0, 1, 0), scene);
      this.ambientLight.intensity = 0.7;
    }

    eventBus.subscribe<TimeChangedEvent>(GameEventType.TIME_CHANGED, (event) => {
      this.updateLighting(event.normalizedTime);
    });
  }

  private updateLighting(normalizedTime: number): void {
    const { fromColors, toColors, blend } = this.getBlendedColors(normalizedTime);

    // Interpolate sky color
    const skyColor = Color3.Lerp(fromColors.sky, toColors.sky, blend);
    this.scene.clearColor.r = skyColor.r;
    this.scene.clearColor.g = skyColor.g;
    this.scene.clearColor.b = skyColor.b;

    // Interpolate ambient color
    this.ambientLight.diffuse = Color3.Lerp(fromColors.ambient, toColors.ambient, blend);
    this.ambientLight.intensity =
      fromColors.ambientIntensity + (toColors.ambientIntensity - fromColors.ambientIntensity) * blend;

    // Sun intensity
    this.sunLight.intensity =
      fromColors.sunIntensity + (toColors.sunIntensity - fromColors.sunIntensity) * blend;

    // Rotate sun direction based on time
    const sunAngle = normalizedTime * Math.PI * 2;
    this.sunLight.direction = new Vector3(
      Math.cos(sunAngle),
      -Math.abs(Math.sin(sunAngle)) - 0.3,
      Math.sin(sunAngle) * 0.5
    );

    // Sun color
    this.sunLight.diffuse = Color3.Lerp(fromColors.ambient, toColors.ambient, blend);
  }

  private getBlendedColors(t: number): {
    fromColors: ColorSet;
    toColors: ColorSet;
    blend: number;
  } {
    if (t < 0.25) {
      return { fromColors: NIGHT, toColors: NIGHT, blend: 0 };
    } else if (t < 0.333) {
      const blend = (t - 0.25) / (0.333 - 0.25);
      if (blend < 0.5) {
        return { fromColors: NIGHT, toColors: DAWN, blend: blend * 2 };
      }
      return { fromColors: DAWN, toColors: DAY, blend: (blend - 0.5) * 2 };
    } else if (t < 0.75) {
      return { fromColors: DAY, toColors: DAY, blend: 0 };
    } else if (t < 0.833) {
      const blend = (t - 0.75) / (0.833 - 0.75);
      if (blend < 0.5) {
        return { fromColors: DAY, toColors: DUSK, blend: blend * 2 };
      }
      return { fromColors: DUSK, toColors: NIGHT, blend: (blend - 0.5) * 2 };
    } else {
      return { fromColors: NIGHT, toColors: NIGHT, blend: 0 };
    }
  }
}
