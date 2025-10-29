import { supabase } from '../lib/supabase';

interface EmailData {
  to: string;
  name: string;
  type: 'welcome' | 'trial_warning' | 'trial_expired' | 'remarketing_discount';
}

export const useEmailService = () => {
  const sendEmail = async (data: EmailData) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: data
      });

      if (error) {
        console.error('Erro ao enviar email:', error);
        return false;
      }

      console.log('Email enviado com sucesso:', result);
      return true;
    } catch (error) {
      console.error('Erro no serviço de email:', error);
      return false;
    }
  };

  const sendWelcomeEmail = async (userEmail: string, userName: string) => {
    return await sendEmail({
      to: userEmail,
      name: userName,
      type: 'welcome'
    });
  };

  const sendTrialWarningEmail = async (userEmail: string, userName: string) => {
    return await sendEmail({
      to: userEmail,
      name: userName,
      type: 'trial_warning'
    });
  };

  const sendTrialExpiredEmail = async (userEmail: string, userName: string) => {
    return await sendEmail({
      to: userEmail,
      name: userName,
      type: 'trial_expired'
    });
  };

  const sendRemarketingEmail = async (userEmail: string, userName: string) => {
    return await sendEmail({
      to: userEmail,
      name: userName,
      type: 'remarketing_discount'
    });
  };

  return {
    sendWelcomeEmail,
    sendTrialWarningEmail,
    sendTrialExpiredEmail,
    sendRemarketingEmail
  };
};
