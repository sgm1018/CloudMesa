import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserLoginDto } from '../dto/auth/UserLoginDto';
import { authService } from '../services/AuthService';
import { log } from 'console';
import { useNavigate } from 'react-router-dom';


interface AuthContextType {
    user: UserLoginDto | null;
    isAuthenticated: () => boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, surname: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserLoginDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Verificar si hay un usuario ya logueado al inicializar
        // setUser(currentUser);
        setIsLoading(false);
    }, [user]);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const userData = await authService.login(email, password);
            sessionStorage.setItem('publicKey', userData!.user.publicKey);
            setUser(userData as UserLoginDto); // Cast to UserLoginDto
            console.log(userData);
            navigate("/dashboard");
        } catch (error) {
            // Re-lanzar el error para que el componente lo maneje
                throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const isAuthenticated = () => {
        return !!sessionStorage.getItem('accesToken') || !!user;
    };

    const register = async (name: string, surname: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            const userData = await authService.register(name, surname, email, password);
            setUser(userData);
            navigate("/dashboard");
            
        } catch (error) {
            // Re-lanzar el error para que el componente lo maneje
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};