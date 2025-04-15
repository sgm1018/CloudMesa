// ... (imports and @Component decorator remain unchanged)

import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { LoginBackground } from "../../components/backgrounds/login/login-background.component";
import { LoginDto } from "../../shared/dto/auth/Login";
import { RegisterDto } from "../../shared/dto/auth/Register";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-auth-page",
  standalone: true,
  imports: [CommonModule, FormsModule, LoginBackground],
  template: `
    <div class="relative w-full h-screen overflow-hidden">
      <!-- Background component positioned absolutely -->
      <div class="absolute inset-0 z-10">
        <app-login-bg></app-login-bg>
      </div>
      <div
        class="min-h-screen max-h-[90vh] w-full h-full overflow-auto absolute z-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      >
        <div
          class="max-w-md w-full space-y-8 bg-[var(--card-bg)] p-8 shadow-lg rounded-xl border border-[var(--border-color)]"
        >
          <div class="text-center">
            <img class="mx-auto h-16  w-auto" [src]="logoRoute" alt="Logo" />
            <!-- <h2
              class="mt-6 text-center text-3xl font-extrabold text-[var(--text-primary)]"
            >
              {{ isLoginMode ? "Log In" : "Create account" }}
            </h2> -->
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-[var(--border-color)] mb-6">
            <button
              [ngClass]="{
                'border-[var(--accent)] text-[var(--accent)]': isLoginMode,
                'border-transparent text-[var(--text-secondary)]': !isLoginMode
              }"
              class="py-4 px-6 font-medium text-sm border-b-2 flex-1 transition-colors duration-200"
              (click)="isLoginMode = true"
            >
              Log In
            </button>
            <button
              [ngClass]="{
                'border-[var(--accent)] text-[var(--accent)]': !isLoginMode,
                'border-transparent text-[var(--text-secondary)]': isLoginMode
              }"
              class="py-4 px-6 font-medium text-sm border-b-2 flex-1 transition-colors duration-200"
              (click)="isLoginMode = false"
            >
              Sign in
            </button>
          </div>

          <!-- Login Form -->
          <div *ngIf="isLoginMode" class="space-y-6">
            <form (ngSubmit)="login()">
              <div class="space-y-5">
                <div>
                  <label
                    for="email-login"
                    class="block text-sm font-medium text-[var(--text-secondary)] mb-1"
                    >Email</label
                  >
                  <input
                    id="email-login"
                    type="email"
                    required
                    [(ngModel)]="loginDto.email"
                    name="email"
                    class="block w-full px-3 py-1.5 border border-[var(--border-color)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label
                    for="password-login"
                    class="block text-sm font-medium text-[var(--text-secondary)] mb-1"
                    >Contraseña</label
                  >
                  <input
                    id="password-login"
                    type="password"
                    required
                    [(ngModel)]="loginDto.password"
                    name="password"
                    class="block w-full px-3 py-1.5 border border-[var(--border-color)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                  />
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      class="h-4 w-4 text-[var(--accent)] focus:ring-[var(--accent)] border-[var(--border-color)] rounded"
                    />
                    <label
                      for="remember-me"
                      class="ml-2 block text-sm text-[var(--text-secondary)]"
                      >Recordarme</label
                    >
                  </div>
                  <a
                    href="#"
                    class="text-sm font-medium text-[var(--accent)] hover:opacity-80 transition-opacity"
                    >¿Olvidaste tu contraseña?</a
                  >
                </div>

                <button
                  type="submit"
                  class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-[var(--button-text)] bg-[var(--button-bg)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] transition-all duration-200"
                >
                  Iniciar sesión
                </button>
              </div>
            </form>
          </div>

          <!-- Register Form -->
          <div *ngIf="!isLoginMode" class="space-y-6">
            <form (ngSubmit)="register()">
              <div class="space-y-5">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      for="name"
                      class="block text-sm font-medium text-[var(--text-secondary)] mb-1"
                      >Nombre</label
                    >
                    <input
                      id="name"
                      type="text"
                      required
                      [(ngModel)]="registerDto.name"
                      name="name"
                      class="block w-full px-3 py-1.5 border border-[var(--border-color)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label
                      for="surname"
                      class="block text-sm font-medium text-[var(--text-secondary)] mb-1"
                      >Apellido</label
                    >
                    <input
                      id="surname"
                      type="text"
                      required
                      [(ngModel)]="registerDto.surname"
                      name="surname"
                      class="block w-full px-3 py-1.5 border border-[var(--border-color)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    for="email-register"
                    class="block text-sm font-medium text-[var(--text-secondary)] mb-1"
                    >Email</label
                  >
                  <input
                    id="email-register"
                    type="email"
                    required
                    [(ngModel)]="registerDto.email"
                    name="email"
                    class="block w-full px-3 py-1.5 border border-[var(--border-color)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label
                    for="publicKey"
                    class="block text-sm font-medium text-[var(--text-secondary)] mb-1"
                    >Clave pública</label
                  >
                  <input
                    id="publicKey"
                    type="text"
                    [(ngModel)]="registerDto.publicKey"
                    name="publicKey"
                    class="block w-full px-3 py-1.5 border border-[var(--border-color)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label
                    for="password-register"
                    class="block text-sm font-medium text-[var(--text-secondary)] mb-1"
                    >Contraseña</label
                  >
                  <input
                    id="password-register"
                    type="password"
                    required
                    [(ngModel)]="registerDto.password"
                    name="password"
                    class="block w-full px-3 py-1.5 border border-[var(--border-color)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label
                    for="confirm-password"
                    class="block text-sm font-medium text-[var(--text-secondary)] mb-1"
                    >Confirmar contraseña</label
                  >
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    [(ngModel)]="confirmPassword"
                    name="confirmPassword"
                    class="block w-full px-3 py-1.5 border border-[var(--border-color)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                  />
                  <p
                    *ngIf="
                      registerDto.password !== confirmPassword &&
                      confirmPassword
                    "
                    class="mt-1 text-sm text-red-600"
                  >
                    Las contraseñas no coinciden
                  </p>
                </div>

                <button
                  type="submit"
                  [disabled]="registerDto.password !== confirmPassword"
                  class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-[var(--button-text)] bg-[var(--button-bg)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] transition-all duration-200 disabled:opacity-50"
                >
                  Crear cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AuthPageComponent implements OnInit {
  // Component class remains unchanged
  public loginDto: LoginDto = {
    email: "",
    password: "",
  };
  public registerDto: RegisterDto = {
    email: "",
    password: "",
    name: "",
    publicKey: "",
    surname: "",
  };
  public confirmPassword: string = "";
  public logoRoute: string = "/assets/logos/png/logo-no-background.png";
  public isLoginMode: boolean = true;

  constructor(private authService: AuthService, private router: Router){}

  ngOnInit(): void {
      if(this.authService.isLoggedIn()){
        this.authService.goMainPage();
      }
  }

  login() {
    this.authService.login(this.loginDto.email, this.loginDto.password).subscribe({
      next: (response) => {
        this.authService.setSessionStorage(response);
        this.router.navigate(['/main']);
        console.log("Login successful", response);
      },
      error: (error) => {
        console.error("Login failed", error);
      },
    });
  }

  register() {
    this.authService.register(this.registerDto).subscribe({
      next: (response) => {
        this.authService.setSessionStorage(response);
        this.authService.goMainPage();
        console.log("Registration successful", response);
      },
      error: (error) => {
        console.error("Registration failed", error);
      },
    }); 
  }

}
