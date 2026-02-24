/**
 * Immutable value object representing a 3D position
 */
export class Position {
  private constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number
  ) {}

  static create(x: number, y: number, z: number): Position {
    return new Position(x, y, z);
  }

  static zero(): Position {
    return new Position(0, 0, 0);
  }

  /**
   * Calculate distance to another position
   */
  distanceTo(other: Position): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Create a new position by adding a delta
   */
  add(dx: number, dy: number, dz: number): Position {
    return new Position(this.x + dx, this.y + dy, this.z + dz);
  }

  /**
   * Check if two positions are equal (with optional tolerance)
   */
  equals(other: Position, tolerance: number = 0.001): boolean {
    return (
      Math.abs(this.x - other.x) < tolerance &&
      Math.abs(this.y - other.y) < tolerance &&
      Math.abs(this.z - other.z) < tolerance
    );
  }

  /**
   * Convert to array format [x, y, z]
   */
  toArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    return `Position(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`;
  }
}
