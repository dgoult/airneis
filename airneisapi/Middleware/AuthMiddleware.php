<?php
namespace Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AuthMiddleware {
    public function __invoke(Request $request, $handler): Response {
        $authHeader = $request->getHeader('Authorization');
        if (!$authHeader) {
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(json_encode(["message" => "Token manquant"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }

        $token = str_replace('Bearer ', '', $authHeader[0]);

        try {
            $decoded = JWT::decode($token, new Key($_ENV['JWT_SECRET'], 'HS256'));
            
            // Vérifiez que le token contient bien l'ID utilisateur
            if (!isset($decoded->data->user_id)) {
                $response = new \Slim\Psr7\Response();
                $response->getBody()->write(json_encode(["message" => "Token invalide - user_id manquant"]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
            }

            // Ajouter l'ID utilisateur dans les attributs de la requête
            $request = $request->withAttribute('user_id', $decoded->data->user_id);

            return $handler->handle($request);
        } catch (\Exception $e) {
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(json_encode(["message" => "Token invalide"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }
    }
}