
import React from 'react';
import { Link } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';

const Login = () => {
  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <Link to="/" className="inline-flex items-center">
            <img src="/logo.svg" alt="TownBook Logo" className="h-10" />
          </Link>
        </div>
        
        <AuthForm />
      </div>
    </div>
  );
};

export default Login;
