  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    try {
      console.log("Iniciando cadastro...");
      // A verificação manual de usuário existente foi removida.
      // O supabase.auth.signUp já lida com a verificação de e-mail existente.

      console.log("Verificando se email já existe...");
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (signUpError) {
        console.error("Erro no signUp do Supabase:", signUpError);
        throw signUpError;
      }

      if (signUpData.user) {
        // Se o signUp for bem-sucedido, o usuário é criado no auth.users e o ID é retornado.
        // O Supabase Auth garante que o email não exista antes de criar o usuário.
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: signUpData.user.id,
              full_name: fullName,
              email: email,
              avatar_url: "",
              telefone: "",
              cpf: "",
              cnpj: "",
              data_nascimento: "",
            },
          ]);

        if (profileError) {
          console.error("Erro ao criar perfil:", profileError);
          throw profileError;
        }

        return profileData;
      }
    } catch (error) {
      console.error("Erro no cadastro:", error);
      throw error;
    }
  };
