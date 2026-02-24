import { Scene, SceneLoader, AbstractMesh, AssetsManager, TextureAssetTask } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

/**
 * Asset types that can be loaded
 */
export enum AssetType {
  MODEL = 'model',
  TEXTURE = 'texture',
  SOUND = 'sound',
}

/**
 * Asset metadata
 */
export interface IAssetMetadata {
  id: string;
  type: AssetType;
  path: string;
  name: string;
}

/**
 * Asset loader for managing 3D models, textures, and sounds
 * Supports Kenney assets and other low-poly models
 */
export class AssetLoader {
  private scene: Scene;
  private assetsManager: AssetsManager;
  private loadedAssets: Map<string, AbstractMesh | unknown>;

  constructor(scene: Scene) {
    this.scene = scene;
    this.assetsManager = new AssetsManager(scene);
    this.loadedAssets = new Map();

    // Configure assets manager
    this.assetsManager.useDefaultLoadingScreen = false;
  }

  /**
   * Load a 3D model (GLB, GLTF, OBJ, etc.)
   */
  async loadModel(
    assetId: string,
    modelPath: string,
    fileName: string
  ): Promise<AbstractMesh[]> {
    try {
      const result = await SceneLoader.ImportMeshAsync('', modelPath, fileName, this.scene);

      // Store root mesh
      if (result.meshes.length > 0 && result.meshes[0]) {
        this.loadedAssets.set(assetId, result.meshes[0]);
      }

      console.log(`Model loaded: ${assetId} from ${modelPath}${fileName}`);
      return result.meshes;
    } catch (error) {
      console.error(`Failed to load model ${assetId}:`, error);
      throw error;
    }
  }

  /**
   * Load multiple assets using AssetsManager
   */
  async loadAssets(assets: IAssetMetadata[]): Promise<void> {
    return new Promise((resolve) => {
      assets.forEach((asset) => {
        switch (asset.type) {
          case AssetType.MODEL:
            // Models are loaded individually
            break;
          case AssetType.TEXTURE:
            this.addTextureTask(asset.id, asset.path);
            break;
          default:
            console.warn(`Unsupported asset type: ${asset.type}`);
        }
      });

      this.assetsManager.onFinish = () => {
        console.log('All assets loaded');
        resolve();
      };

      this.assetsManager.onTaskErrorObservable.add((task) => {
        console.error(`Failed to load asset: ${task.name}`, task.errorObject);
      });

      // If no tasks, resolve immediately
      resolve();
    });
  }

  /**
   * Add texture loading task
   */
  private addTextureTask(assetId: string, texturePath: string): TextureAssetTask {
    const task = this.assetsManager.addTextureTask(assetId, texturePath);
    task.onSuccess = (loadedTask) => {
      this.loadedAssets.set(assetId, loadedTask.texture);
      console.log(`Texture loaded: ${assetId}`);
    };
    return task;
  }

  /**
   * Get loaded asset by ID
   */
  getAsset(assetId: string): AbstractMesh | unknown | null {
    return this.loadedAssets.get(assetId) ?? null;
  }

  /**
   * Clone a loaded mesh
   */
  cloneMesh(assetId: string, newName: string): AbstractMesh | null {
    const asset = this.loadedAssets.get(assetId);
    if (asset && asset instanceof AbstractMesh) {
      return asset.clone(newName, null);
    }
    return null;
  }

  /**
   * Check if asset is loaded
   */
  isLoaded(assetId: string): boolean {
    return this.loadedAssets.has(assetId);
  }

  /**
   * Get loading progress
   */
  getProgress(): number {
    // Note: AssetsManager doesn't expose tasks array in newer versions
    // This is a placeholder for future implementation
    return 100;
  }

  /**
   * Clear all loaded assets
   */
  clearAssets(): void {
    this.loadedAssets.forEach((asset) => {
      if (asset && typeof (asset as { dispose?: () => void }).dispose === 'function') {
        (asset as { dispose: () => void }).dispose();
      }
    });
    this.loadedAssets.clear();
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.clearAssets();
  }
}

/**
 * Kenney Survival Kit asset paths
 * Update these paths based on where you place the Kenney assets
 */
export const KENNEY_ASSETS = {
  // Structures
  TENT: { id: 'tent', path: '/assets/models/kenney/', file: 'tent.glb' },
  CAMPFIRE: { id: 'campfire', path: '/assets/models/kenney/', file: 'campfire.glb' },
  WOODEN_CABIN: { id: 'wooden_cabin', path: '/assets/models/kenney/', file: 'cabin.glb' },

  // Resources
  TREE_PINE: { id: 'tree_pine', path: '/assets/models/kenney/', file: 'tree_pine.glb' },
  ROCK: { id: 'rock', path: '/assets/models/kenney/', file: 'rock.glb' },

  // Items
  AXE: { id: 'axe', path: '/assets/models/kenney/', file: 'axe.glb' },
  PICKAXE: { id: 'pickaxe', path: '/assets/models/kenney/', file: 'pickaxe.glb' },
} as const;
