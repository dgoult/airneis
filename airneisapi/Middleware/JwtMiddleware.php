<?php
namespace Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtMiddleware {
    public function __invoke($request, $handler) {
        $authorizationHeader = $request->getHeader('Authorization');
        
        if ($authorizationHeader && preg_match('/Bearer\s(\S+)/', $authorizationHeader[0], $matches)) {
            $token = $matches[1];
            try {
                $decoded = JWT::decode($token, new Key($_ENV['JWT_SECRET'], 'HS256'));
                
                // Ajouter les informations du token à la requête
                $request = $request->withAttribute('token', $decoded);

                return $handler->handle($request);
            } catch (\Firebase\JWT\ExpiredException $e) {
                $response = new \Slim\Psr7\Response();
                $response->getBody()->write(json_encode(["message" => "Token expiré."]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
            } catch (\Exception $e) {
                $response = new \Slim\Psr7\Response();
                $response->getBody()->write(json_encode(["message" => "Token invalide."]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
            }
        }

        $response = new \Slim\Psr7\Response();
        $response->getBody()->write(json_encode(["message" => "Authorization header non fourni."]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
    }
}