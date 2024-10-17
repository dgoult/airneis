<?php

namespace Controllers;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Mailer {
    private $mail;

    public function __construct() {
        $this->mail = new PHPMailer(true);  // Activer les exceptions

        try {
            // Configuration du serveur SMTP
            $this->mail->isSMTP();
            $this->mail->Host       = $_ENV['MAIL_HOST'];  // Serveur SMTP
            $this->mail->SMTPAuth   = true;
            $this->mail->Username   = $_ENV['MAIL_USERNAME'];  // Email d'envoi
            $this->mail->Password   = $_ENV['MAIL_PASSWORD'];  // Mot de passe SMTP
            $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;  // Chiffrement TLS
            $this->mail->Port       = $_ENV['MAIL_PORT'];  // Port TLS

            // Paramètres généraux
            $this->mail->setFrom($_ENV['MAIL_FROM'], 'Airneis');  // Email d'expéditeur par défaut
        } catch (Exception $e) {
            throw new Exception("Erreur de configuration de PHPMailer : " . $e->getMessage());
        }
    }

    public function sendEmail($to, $subject, $body) {
        try {
            // Paramètres de destinataire
            $this->mail->addAddress($to);

            // Contenu de l'email
            $this->mail->isHTML(false);  // Envoyer en texte brut
            $this->mail->Subject = $subject;
            $this->mail->Body    = $body;

            // Envoyer l'email
            $this->mail->send();
            return true;
        } catch (Exception $e) {
            throw new Exception("L'email n'a pas pu être envoyé. Erreur : {$this->mail->ErrorInfo}");
        }
    }
}