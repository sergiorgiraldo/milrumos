export function canFork(pieceStatus: 'draft' | 'published', isOwner: boolean): boolean {
  return pieceStatus === 'published' && !isOwner;
}

export function isInheritedSection(sectionOrdinal: number, inheritedCount: number): boolean {
  return inheritedCount > 0 && sectionOrdinal <= inheritedCount;
}
