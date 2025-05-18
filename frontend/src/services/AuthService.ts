export class AuthService {
    async login(email: string, password: string): Promise<void> {
    // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // In a real app, we would validate credentials here
        // For demo purposes, accept any non-empty email/password
        if (!email || !password) {
        throw new Error('Please enter both email and password');
        }

        // Simulate successful login
        console.log('User logged in:', { email });
    }
    async register(name: string, surname: string, email: string, password: string): Promise<void> {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
    
        // In a real app, we would validate registration data here
        // For demo purposes, accept any non-empty name/surname/email/password
        if (!name || !surname || !email || !password) {
        throw new Error('Please fill in all fields');
        }
    
        // Simulate successful registration
        console.log('User registered:', { name, surname, email });
    }
}