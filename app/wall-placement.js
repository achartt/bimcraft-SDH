/* SPDX-License-Identifier: Apache-2.0 */
import { locationOffset, typeThickness } from './model-walls.js';
import { wallPath } from './model-tools.js';

// UI references map to the existing IFC justification contract. No second geometry or unit system.
export const WALL_LOCATION_LINES = ['center', 'exterior', 'interior', 'coreCenter', 'coreExterior', 'coreInterior'];
export function placementReference(reference, type, side) {
  const justification = reference === 'outside' ? 'exterior' : reference === 'inside' ? 'interior' : reference;
  if (!WALL_LOCATION_LINES.includes(justification) || !['left', 'right'].includes(side)) throw new Error('Choose a supported wall location line and exterior side.');
  if (!type) throw new Error('The selected wall type is missing or unsupported.');
  const thickness = typeThickness(type), offset = locationOffset(justification, thickness, side, type);
  if (!Number.isFinite(offset)) throw new Error('The selected wall type has no usable core for this location line.');
  return { justification, thickness, axisOffset: -offset };
}
export function placementPath(points, type, reference, side) {
  const spec = placementReference(reference, type, side);
  return wallPath(points, spec.thickness, 'center', side, spec.axisOffset);
}
