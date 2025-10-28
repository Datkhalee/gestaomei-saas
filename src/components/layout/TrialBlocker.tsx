import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useTrialStatus() {
  const { user } = useAuth();

  const trialStatus = useMemo(() => {
    if (!user) {
      return {
        isActive: false,
        isExpired: false,
        daysRemaining: 0,
        expiresAt: null,
      };
    }

    const now = new Date();
    const expiresAt = new Date(user.trial_expira_em);
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Trial está ativo se:
    // 1. Status é 'trial' OU
    // 2. Status é 'ativo' (usuário pagou)
    const isActive = user.status_assinatura === 'trial' || user.status_assinatura === 'ativo';
    
    // Trial expirou se:
    // 1. Dias restantes <= 0 E
    // 2. Status não é 'ativo' (não pagou)
    const isExpired = daysRemaining <= 0 && user.status_assinatura !== 'ativo';

    return {
      isActive: isActive && !isExpired,
      isExpired,
      daysRemaining: Math.max(0, daysRemaining),
      expiresAt,
    };
  }, [user]);

  return trialStatus;
}
