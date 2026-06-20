import { UserRole } from '@prisma/client';
import { createAdminClient } from '@/lib/utils/supabase/admin';
import { prisma } from '@/lib/prisma';

export async function countActiveAdmins(excludeUserId?: string): Promise<number> {
  return prisma.user.count({
    where: {
      role: UserRole.ADMIN,
      isActive: true,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
  });
}

export async function syncUserRoleToSupabase(
  userId: string,
  role: UserRole
): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role },
    });
  } catch (error) {
    console.log('Failed to sync role to Supabase metadata:', error);
  }
}

export async function validateAdminRoleChange(params: {
  targetUserId: string;
  nextRole?: UserRole;
  nextIsActive?: boolean;
  actorUserId: string;
}): Promise<string | null> {
  const { targetUserId, nextRole, nextIsActive, actorUserId } = params;

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { role: true, isActive: true },
  });

  if (!target) return 'User not found';

  const demotingAdmin =
    target.role === UserRole.ADMIN &&
    (nextRole === UserRole.CUSTOMER || nextIsActive === false);

  if (!demotingAdmin) return null;

  if (targetUserId === actorUserId) {
    return 'You cannot demote or deactivate your own admin account';
  }

  const remainingAdmins = await countActiveAdmins(targetUserId);
  if (remainingAdmins === 0) {
    return 'Cannot remove the last active admin';
  }

  return null;
}
