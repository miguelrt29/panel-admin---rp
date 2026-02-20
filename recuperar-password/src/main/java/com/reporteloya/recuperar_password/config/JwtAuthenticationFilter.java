package com.reporteloya.recuperar_password.config;

import com.reporteloya.recuperar_password.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * Filtro encargado de validar el JWT y construir la autenticación.
 * Se ha añadido una excepción para permitir rutas públicas sin token.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // --------------------------------------------------------------------
        // EXCEPCIÓN DE RUTA: Esto evita el error 403 en peticiones DELETE/POST 
        // a /agentes que no llevan Token.
        // --------------------------------------------------------------------
        if (request.getServletPath().contains("/agentes")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 1. Obtenemos encabezado Authorization
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Extraer token
        jwt = authHeader.substring(7);

        // 3. Extraer username (email) del token con manejo de excepciones
        try {
            username = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            // Si el token es inválido, dejamos que la cadena continúe 
            // para que Spring Security maneje la falta de autenticación.
            filterChain.doFilter(request, response);
            return;
        }

        // 4. Si el usuario no está autenticado aún en el contexto:
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // 5. Validación técnica del token (firma y expiración)
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // >>> EXTRAER ROL DEL TOKEN <<<
                String roleFromToken = jwtService.extractClaim(jwt,
                        claims -> claims.get("role", String.class));

                // Convertimos el rol (ej. ADMIN) al formato ROLE_ADMIN
                GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + roleFromToken);

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        Collections.singletonList(authority)
                );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                // 6. Guardamos autenticación en contexto de seguridad
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 7. Continuamos con la cadena de filtros
        filterChain.doFilter(request, response);
    }
}