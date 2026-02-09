package com.reporteloya.recuperar_password.dto;

import com.reporteloya.recuperar_password.entity.Role; // Importar su Enum Role
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Respuesta que se envía al cliente tras un login/registro exitoso
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    // CRÍTICO: El token JWT para el acceso a recursos protegidos
    private String token;

    // Campos adicionales para facilitar la gestión en el Front-end
    private Long userId; // ID del usuario (para búsquedas rápidas)
    private String email; // Email del usuario (para mostrar en el perfil)
    private Role role; // Rol del usuario (para control de acceso en el Front-end)

    // Opcional: El tipo de token (siempre "Bearer" en JWT)
    private String tokenType = "Bearer";
}