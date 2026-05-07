export interface User {
  id: number;
  nombre: string;
  email: string;
  rol?: string;
}

export interface Evaluation {
  id: number;
  fecha: string;
  phq9Score: number;
  gad7Score: number;
  nivelRiesgo: string;
  resultadoIA?: string;
  id_usuario: number;
}

export interface EvaluationCreate {
  phq9Score: number;
  gad7Score: number;
  text_input: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}
