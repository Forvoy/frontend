// Admin wallet addresses for MVP resolution system
// These wallets have permission to resolve news outcomes

export const ADMIN_WALLETS = [
  // Primary admin wallet (replace with actual address)
  '0x580B01f8CDf7606723c3BE0dD2AaD058F5aECa3d', //wallet luthfi 1

  // Backup admin wallet (replace with actual address)
  '0xe0169D648004C38228173CD8674f25FA483fb5c5', // wallet luthfi 2
  '0xa930FDA4B716341c8b5D1b83B67BfC2adFbd1fEd', // wallet tachul
  '0xeF4DB09D536439831FEcaA33fE4250168976535E', // wallet zidan
];

/**
 * Check if a given wallet address is an admin
 * @param address - Wallet address to check
 * @returns boolean - True if address is admin
 */
export function isAdmin(address: string | undefined): boolean {
  if (!address) return false;

  // Normalize addresses to lowercase for comparison
  const normalizedAddress = address.toLowerCase();
  return ADMIN_WALLETS.some(admin => admin.toLowerCase() === normalizedAddress);
}

/**
 * Admin permissions and capabilities
 */
export const ADMIN_PERMISSIONS = {
  canResolveNews: true,
  canModerateContent: true, // Future: content moderation
  canManageDisputes: true,  // Future: dispute resolution
} as const;


