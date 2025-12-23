<?php

class ApiClient
{
    private $baseUrl;

    public function __construct()
    {
        // Points to the Deployed Render Backend
        $this->baseUrl = 'https://secure-fl-backend.onrender.com/api';
    }

    private function request($endpoint, $method = 'GET', $data = [])
    {
        $url = $this->baseUrl . $endpoint;
        $options = [
            'http' => [
                'header' => "Content-type: application/json\r\n",
                'method' => $method,
                'ignore_errors' => true // Don't crash on 400/500
            ]
        ];

        if ($method === 'POST') {
            $options['http']['content'] = json_encode($data);
        }

        $context = stream_context_create($options);
        $result = @file_get_contents($url, false, $context);

        if ($result === FALSE) {
            return null;
        }

        return json_decode($result, true);
    }

    public function getStatus()
    {
        return $this->request('/status');
    }

    public function getLedger()
    {
        return $this->request('/ledger');
    }

    public function startSimulation()
    {
        return $this->request('/start', 'POST', ['db_password' => 'S@i85t@run']);
    }

    public function stopSimulation()
    {
        return $this->request('/stop', 'POST');
    }
}
