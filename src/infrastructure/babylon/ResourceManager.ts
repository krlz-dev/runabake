import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  AbstractMesh,
  ShadowGenerator,
  Mesh,
} from '@babylonjs/core';
import { Resource, ResourceType } from '@domain/entities/Resource';
import { RESOURCE_DEFINITIONS } from '@domain/value-objects/ResourceDefinitions';

interface ResourceInstance {
  resource: Resource;
  meshes: AbstractMesh[];
  position: Vector3;
}

/**
 * Manages resource meshes in the 3D scene.
 * Spawns trees, rocks, and bushes; handles depletion visibility and respawning.
 */
export class ResourceManager {
  private scene: Scene;
  private resources: ResourceInstance[] = [];
  private shadowGenerator: ShadowGenerator | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
    // Try to get shadow generator
    this.shadowGenerator = (scene as Scene & { shadowGenerator?: ShadowGenerator }).shadowGenerator ?? null;
  }

  /**
   * Spawn resources in circular patterns around origin
   */
  spawnResources(): void {
    // Spawn trees in outer ring
    this.spawnInCircle('pine_tree', 12, 20, 35);
    // Spawn rocks in middle ring
    this.spawnInCircle('rock_formation', 8, 10, 25);
    // Spawn bushes scattered
    this.spawnInCircle('berry_bush', 6, 8, 30);
  }

  private spawnInCircle(definitionId: string, count: number, minRadius: number, maxRadius: number): void {
    const config = RESOURCE_DEFINITIONS[definitionId];
    if (!config) return;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const radius = minRadius + Math.random() * (maxRadius - minRadius);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const position = new Vector3(x, 0, z);

      const id = `${definitionId}_${i}`;
      const resource = new Resource(id, config);
      const meshes = this.createResourceMesh(config.type, id, position);

      this.resources.push({ resource, meshes, position });
    }
  }

  private createResourceMesh(type: ResourceType, id: string, position: Vector3): AbstractMesh[] {
    const meshes: AbstractMesh[] = [];

    switch (type) {
      case ResourceType.TREE: {
        // Trunk
        const trunk = MeshBuilder.CreateCylinder(`${id}_trunk`, {
          height: 4,
          diameterTop: 0.5,
          diameterBottom: 0.8,
        }, this.scene);
        trunk.position = position.clone();
        trunk.position.y = 2;
        const trunkMat = new StandardMaterial(`${id}_trunkMat`, this.scene);
        trunkMat.diffuseColor = new Color3(0.4, 0.25, 0.1);
        trunk.material = trunkMat;

        // Foliage (cone)
        const foliage = MeshBuilder.CreateCylinder(`${id}_foliage`, {
          height: 5,
          diameterTop: 0,
          diameterBottom: 3.5,
          tessellation: 8,
        }, this.scene);
        foliage.position = position.clone();
        foliage.position.y = 6;
        const foliageMat = new StandardMaterial(`${id}_foliageMat`, this.scene);
        foliageMat.diffuseColor = new Color3(0.15, 0.45, 0.15);
        foliage.material = foliageMat;

        meshes.push(trunk, foliage);
        break;
      }
      case ResourceType.ROCK: {
        const rock = MeshBuilder.CreatePolyhedron(`${id}_rock`, {
          type: 1,
          size: 1.2,
        }, this.scene) as Mesh;
        rock.position = position.clone();
        rock.position.y = 0.8;
        // Random slight rotation for variety
        rock.rotation.y = Math.random() * Math.PI;
        rock.scaling = new Vector3(
          0.8 + Math.random() * 0.4,
          0.6 + Math.random() * 0.3,
          0.8 + Math.random() * 0.4
        );
        const rockMat = new StandardMaterial(`${id}_rockMat`, this.scene);
        rockMat.diffuseColor = new Color3(0.5, 0.5, 0.5);
        rock.material = rockMat;

        meshes.push(rock);
        break;
      }
      case ResourceType.BUSH: {
        const bush = MeshBuilder.CreateSphere(`${id}_bush`, {
          diameter: 1.5,
          segments: 6,
        }, this.scene);
        bush.position = position.clone();
        bush.position.y = 0.6;
        bush.scaling = new Vector3(1, 0.7, 1);
        const bushMat = new StandardMaterial(`${id}_bushMat`, this.scene);
        bushMat.diffuseColor = new Color3(0.2, 0.5, 0.2);
        bush.material = bushMat;

        meshes.push(bush);
        break;
      }
    }

    // Add shadows
    if (this.shadowGenerator) {
      for (const mesh of meshes) {
        this.shadowGenerator.addShadowCaster(mesh);
      }
    }

    return meshes;
  }

  /**
   * Find the nearest gatherable resource within maxDistance of a position
   */
  findNearestResource(playerPosition: Vector3, maxDistance: number): ResourceInstance | null {
    let nearest: ResourceInstance | null = null;
    let nearestDist = maxDistance;

    for (const instance of this.resources) {
      if (instance.resource.isDepleted) continue;

      const dist = Vector3.Distance(playerPosition, instance.position);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = instance;
      }
    }

    return nearest;
  }

  /**
   * Get the Resource entity from a ResourceInstance
   */
  getResource(instance: ResourceInstance): Resource {
    return instance.resource;
  }

  /**
   * Get position of a resource instance
   */
  getPosition(instance: ResourceInstance): Vector3 {
    return instance.position;
  }

  /**
   * Update all resources (respawn timers, mesh visibility)
   */
  update(deltaTime: number): void {
    for (const instance of this.resources) {
      if (instance.resource.isDepleted) {
        const respawned = instance.resource.updateRespawn(deltaTime);
        if (respawned) {
          // Show meshes again
          for (const mesh of instance.meshes) {
            mesh.setEnabled(true);
          }
        } else {
          // Keep meshes hidden
          for (const mesh of instance.meshes) {
            mesh.setEnabled(false);
          }
        }
      }
    }
  }
}
