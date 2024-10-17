<?php
namespace Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AdminMiddleware {
    public function __invoke(Request $request, $handler): Response {
        $authHeader = $request->getHeader('Authorization');

        if (!$authHeader) {
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(json_encode(["message" => "Token manquant"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }

        $token = str_replace('Bearer ', '', $authHeader[0]);
        $secretKey = $_ENV['JWT_SECRET'] ?? null;

        if (!$secretKey) {
            throw new \Exception('La clé JWT_SECRET est manquante.');
        }

        try {
            $decoded = JWT::decode($token, new Key($_ENV['JWT_SECRET'], 'HS256'));
            $user = $decoded->data;

            if ($user->role !== 'admin') {
                $response = new \Slim\Psr7\Response();
                $response->getBody()->write(json_encode(["message" => "Accès non autorisé, rôle admin requis"]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(403);
            }

            $request = $request->withAttribute('user', $user);
            return $handler->handle($request);

        } catch (Exception $e) {
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(json_encode(["message" => "Token invalide"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }
    }
}
