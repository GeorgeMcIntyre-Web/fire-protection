/**
 * Fire Design Engine - Babylon.js 3D Engine for Sprinkler Design
 * 
 * Handles 3D scene setup, sprinkler placement, and visualization
 */

import * as BABYLON from '@babylonjs/core'
import { EventEmitter } from 'events'

export interface SprinklerData {
  id: string
  position: { x: number; y: number; z: number }
  coverageRadius?: number
}

export interface DesignExport {
  sprinklers: SprinklerData[]
  count: number
  timestamp: string
  floorPlanUrl?: string
  floorPlanScale?: number
}

export class FireDesignEngine extends EventEmitter {
  private engine: BABYLON.Engine
  private scene: BABYLON.Scene
  private camera: BABYLON.ArcRotateCamera
  private sprinklers: Map<string, BABYLON.Mesh> = new Map()
  private coverageCircles: Map<string, BABYLON.Mesh> = new Map()
  private currentTool: 'select' | 'place' = 'select'
  private ghostSprinkler: BABYLON.Mesh | null = null
  private selectedSprinkler: BABYLON.Mesh | null = null
  private ground: BABYLON.Mesh | null = null
  private floorPlanTexture: BABYLON.Texture | null = null

  constructor(canvas: HTMLCanvasElement) {
    super()

    // Initialize engine
    this.engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: true,
      antialias: true
    })

    // Create scene
    this.scene = new BABYLON.Scene(this.engine)
    this.scene.clearColor = new BABYLON.Color4(0.95, 0.95, 0.95, 1)

    // Setup camera (top-down view)
    this.camera = new BABYLON.ArcRotateCamera(
      'camera',
      -Math.PI / 2, // Alpha (horizontal rotation)
      0.1, // Beta (vertical angle - slight for depth)
      30, // Radius (distance)
      BABYLON.Vector3.Zero(),
      this.scene
    )
    
    // Limit camera angles for top-down view
    this.camera.lowerBetaLimit = 0.1
    this.camera.upperBetaLimit = Math.PI / 3
    this.camera.attachControl(canvas, true)
    this.camera.wheelPrecision = 50

    // Lighting
    const light = new BABYLON.HemisphericLight(
      'light',
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    )
    light.intensity = 0.9

    // Additional directional light for better visibility
    const directionalLight = new BABYLON.DirectionalLight(
      'dirLight',
      new BABYLON.Vector3(0.5, -1, 0.5),
      this.scene
    )
    directionalLight.intensity = 0.5

    // Ground grid
    this.createGrid()

    // Input handling
    this.setupInputHandlers()

    // Render loop
    this.engine.runRenderLoop(() => {
      this.scene.render()
    })

    // Handle resize
    window.addEventListener('resize', () => {
      this.engine.resize()
    })
  }

  private createGrid(): void {
    const gridMaterial = new BABYLON.StandardMaterial('grid', this.scene)
    gridMaterial.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95)
    gridMaterial.alpha = 0.98

    this.ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      { width: 50, height: 50 },
      this.scene
    )
    this.ground.material = gridMaterial
    this.ground.metadata = { type: 'ground' }
  }

  private setupInputHandlers(): void {
    this.scene.onPointerObservable.add((pointerInfo) => {
      switch (pointerInfo.type) {
        case BABYLON.PointerEventTypes.POINTERMOVE:
          if (this.currentTool === 'place') {
            this.updateGhostPosition(pointerInfo.pickInfo)
          }
          break

        case BABYLON.PointerEventTypes.POINTERDOWN:
          if (this.currentTool === 'place' && pointerInfo.pickInfo?.hit) {
            const point = pointerInfo.pickInfo.pickedPoint!
            // Only place on ground
            if (pointerInfo.pickInfo.pickedMesh?.metadata?.type === 'ground') {
              this.placeSprinkler(point)
            }
          } else if (this.currentTool === 'select' && pointerInfo.pickInfo?.pickedMesh) {
            const mesh = pointerInfo.pickInfo.pickedMesh
            if (mesh.metadata?.type === 'sprinkler') {
              this.selectSprinkler(mesh as BABYLON.Mesh)
            }
          }
          break
      }
    })

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.selectedSprinkler) {
          this.deleteSelected()
        }
      }
    })
  }

  public setTool(tool: 'select' | 'place'): void {
    this.currentTool = tool

    if (tool === 'place') {
      this.createGhostSprinkler()
    } else {
      this.removeGhostSprinkler()
    }
  }

  private createGhostSprinkler(): void {
    this.removeGhostSprinkler()

    this.ghostSprinkler = BABYLON.MeshBuilder.CreateCylinder(
      'ghost',
      { diameter: 0.2, height: 0.3 },
      this.scene
    )

    const material = new BABYLON.StandardMaterial('ghostMat', this.scene)
    material.diffuseColor = BABYLON.Color3.Blue()
    material.alpha = 0.5
    material.emissiveColor = BABYLON.Color3.Blue()

    this.ghostSprinkler.material = material
    this.ghostSprinkler.isPickable = false
    this.ghostSprinkler.position.y = 2.5
  }

  private removeGhostSprinkler(): void {
    if (this.ghostSprinkler) {
      this.ghostSprinkler.dispose()
      this.ghostSprinkler = null
    }
  }

  private updateGhostPosition(pickInfo?: BABYLON.PickingInfo): void {
    if (!this.ghostSprinkler || !pickInfo?.hit) return

    // Only show ghost on ground
    if (pickInfo.pickedMesh?.metadata?.type !== 'ground') {
      this.ghostSprinkler.setEnabled(false)
      return
    }

    this.ghostSprinkler.setEnabled(true)

    const pos = pickInfo.pickedPoint!
    const snapped = new BABYLON.Vector3(
      Math.round(pos.x * 2) / 2, // Snap to 0.5m grid
      2.5,
      Math.round(pos.z * 2) / 2
    )

    this.ghostSprinkler.position = snapped
  }

  private placeSprinkler(position: BABYLON.Vector3): void {
    const snapped = new BABYLON.Vector3(
      Math.round(position.x * 2) / 2,
      2.5,
      Math.round(position.z * 2) / 2
    )

    // Check if position is too close to existing sprinkler
    const minDistance = 3.0 // Minimum spacing in meters
    for (const [id, existing] of this.sprinklers) {
      const distance = BABYLON.Vector3.Distance(existing.position, snapped)
      if (distance < minDistance) {
        // Too close, don't place
        return
      }
    }

    // Create sprinkler
    const id = `SP-${Date.now()}-${this.sprinklers.size}`
    const sprinkler = this.createSprinklerMesh(id, snapped)

    this.sprinklers.set(id, sprinkler)
    this.emit('sprinklerAdded', { id, position: snapped })

    // Create coverage circle
    this.createCoverageCircle(id, snapped)

    // Update count
    this.emit('sprinklerCountChanged', this.sprinklers.size)
  }

  private createSprinklerMesh(
    id: string,
    position: BABYLON.Vector3
  ): BABYLON.Mesh {
    // Sprinkler body (cylinder)
    const body = BABYLON.MeshBuilder.CreateCylinder(
      id,
      { diameter: 0.15, height: 0.25 },
      this.scene
    )
    body.position = position

    // Sprinkler head (smaller cylinder on top)
    const head = BABYLON.MeshBuilder.CreateCylinder(
      `${id}_head`,
      { diameter: 0.1, height: 0.05 },
      this.scene
    )
    head.position = new BABYLON.Vector3(position.x, position.y + 0.15, position.z)
    head.parent = body

    const material = new BABYLON.StandardMaterial(`mat_${id}`, this.scene)
    material.diffuseColor = BABYLON.Color3.Red()
    material.specularColor = BABYLON.Color3.White()
    material.emissiveColor = new BABYLON.Color3(0.2, 0, 0)

    body.material = material
    head.material = material
    body.metadata = { type: 'sprinkler', id }
    head.metadata = { type: 'sprinkler_part', id }

    return body
  }

  private createCoverageCircle(id: string, position: BABYLON.Vector3, radius: number = 3.2): void {
    const circle = BABYLON.MeshBuilder.CreateDisc(
      `coverage_${id}`,
      { radius, tessellation: 64 },
      this.scene
    )

    circle.position = new BABYLON.Vector3(position.x, 0.01, position.z)
    circle.rotation.x = Math.PI / 2

    const material = new BABYLON.StandardMaterial(`coverage_mat_${id}`, this.scene)
    material.diffuseColor = BABYLON.Color3.Blue()
    material.alpha = 0.15
    material.backFaceCulling = false
    material.emissiveColor = new BABYLON.Color3(0, 0, 0.1)

    circle.material = material
    circle.isPickable = false
    circle.parent = this.sprinklers.get(id)!

    this.coverageCircles.set(id, circle)
  }

  private selectSprinkler(mesh: BABYLON.Mesh): void {
    // Deselect previous
    if (this.selectedSprinkler) {
      const material = this.selectedSprinkler.material as BABYLON.StandardMaterial
      material.emissiveColor = new BABYLON.Color3(0.2, 0, 0)
    }

    // Select new
    this.selectedSprinkler = mesh
    const material = mesh.material as BABYLON.StandardMaterial
    material.emissiveColor = BABYLON.Color3.Yellow()

    this.emit('sprinklerSelected', { id: mesh.metadata.id })
  }

  private deleteSelected(): void {
    if (!this.selectedSprinkler) return

    const id = this.selectedSprinkler.metadata.id

    // Remove sprinkler
    this.sprinklers.delete(id)
    this.selectedSprinkler.dispose()

    // Remove coverage circle
    const coverage = this.coverageCircles.get(id)
    if (coverage) {
      coverage.dispose()
      this.coverageCircles.delete(id)
    }

    this.selectedSprinkler = null
    this.emit('sprinklerRemoved', { id })
    this.emit('sprinklerCountChanged', this.sprinklers.size)
  }

  public autoPlaceSprinklers(floorArea: number, hazardClass: string): void {
    // Clear existing
    this.clearAllSprinklers()

    // Calculate spacing based on hazard
    const coverageRadius = 3.2 // meters (standard coverage)
    const spacing = coverageRadius * 1.8 // 90% overlap for safety

    // Calculate grid
    const gridSize = Math.sqrt(floorArea)
    const countX = Math.ceil(gridSize / spacing)
    const countZ = Math.ceil(gridSize / spacing)

    // Place in grid
    for (let i = 0; i < countX; i++) {
      for (let j = 0; j < countZ; j++) {
        const pos = new BABYLON.Vector3(
          (i - countX / 2) * spacing,
          2.5,
          (j - countZ / 2) * spacing
        )
        this.placeSprinkler(pos)
      }
    }

    this.emit('autoPlacementComplete', { count: this.sprinklers.size })
  }

  public clearAllSprinklers(): void {
    // Dispose all sprinklers
    for (const [id, mesh] of this.sprinklers) {
      mesh.dispose()
    }
    this.sprinklers.clear()

    // Dispose all coverage circles
    for (const [id, circle] of this.coverageCircles) {
      circle.dispose()
    }
    this.coverageCircles.clear()

    this.selectedSprinkler = null
    this.emit('sprinklerCountChanged', 0)
  }

  public loadFloorPlan(imageUrl: string, scale: number = 1): void {
    // Remove existing floor plan texture
    if (this.floorPlanTexture) {
      this.floorPlanTexture.dispose()
    }

    // Create new texture
    this.floorPlanTexture = new BABYLON.Texture(imageUrl, this.scene)
    
    if (this.ground) {
      const material = this.ground.material as BABYLON.GridMaterial
      material.diffuseTexture = this.floorPlanTexture
      material.opacity = 0.7 // Make grid visible over floor plan
    }

    this.emit('floorPlanLoaded', { url: imageUrl, scale })
  }

  public exportDesign(): DesignExport {
    const sprinklers: SprinklerData[] = Array.from(this.sprinklers.entries()).map(([id, mesh]) => ({
      id,
      position: {
        x: mesh.position.x,
        y: mesh.position.y,
        z: mesh.position.z
      },
      coverageRadius: 3.2
    }))

    return {
      sprinklers,
      count: sprinklers.length,
      timestamp: new Date().toISOString(),
      floorPlanUrl: this.floorPlanTexture?.url,
      floorPlanScale: 1
    }
  }

  public loadDesign(design: DesignExport): void {
    // Clear existing
    this.clearAllSprinklers()

    // Load floor plan if exists
    if (design.floorPlanUrl) {
      this.loadFloorPlan(design.floorPlanUrl, design.floorPlanScale || 1)
    }

    // Place sprinklers
    for (const sprinkler of design.sprinklers) {
      const pos = new BABYLON.Vector3(
        sprinkler.position.x,
        sprinkler.position.y,
        sprinkler.position.z
      )
      this.placeSprinkler(pos)
    }

    this.emit('designLoaded', { count: design.count })
  }

  public dispose(): void {
    this.clearAllSprinklers()
    
    if (this.floorPlanTexture) {
      this.floorPlanTexture.dispose()
    }

    if (this.ghostSprinkler) {
      this.ghostSprinkler.dispose()
    }

    this.scene.dispose()
    this.engine.dispose()
  }
}

