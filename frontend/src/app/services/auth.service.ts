import { RefreshTokenDto } from "./../shared/dto/auth/RefreshToken";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseService } from "./base.service";
import { RegisterDto } from "../shared/dto/auth/Register";
import { LoginDto } from "../shared/dto/auth/Login";
import { LoginTokenDto } from "../shared/dto/auth/LoginToken";
import { BehaviorSubject } from 'rxjs';
import { UserGetDto } from '../shared/dto/user/UserGetDto';
import { enviroment } from "../../../enviroment";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class AuthService extends BaseService {
  private currentUserSubject = new BehaviorSubject<UserGetDto | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(http: HttpClient, private router: Router) {
    super(http);
    this.apiPath = "auth";
  }

  login(email: string, password: string) {
    const loginDto: LoginDto = { email: email, password: password };
    return this.http.post<LoginTokenDto>(enviroment.API_URL+ this.apiPath + "/login", loginDto);
  }

  register(registerDto: RegisterDto) {
    return this.http.post<LoginTokenDto>(enviroment.API_URL+ this.apiPath + "/register", registerDto);
  }

  logout() {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: sessionStorage.getItem("refreshToken") || "",
    };
    this.removeSessionStorage();
    this.router.navigate(["/auth"]);
    return this.http.post(enviroment.API_URL+ this.apiPath + "/logout", refreshTokenDto );
  }

  refresh() {
    const resfreshTokenDto: RefreshTokenDto = {
      refreshToken: localStorage.getItem("refreshToken") || "",
    };
    return this.http.post(enviroment.API_URL+ this.apiPath + "/refresh", resfreshTokenDto);
  }

  setSessionStorage(loginTokenDto : LoginTokenDto) {
    sessionStorage.setItem("accessToken", loginTokenDto.accessToken);
    sessionStorage.setItem("refreshToken", loginTokenDto.refreshToken); //chabge to http cookie
    this.currentUserSubject.next(loginTokenDto.user);
  }
  removeSessionStorage() {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem("accessToken") && !!sessionStorage.getItem("refreshToken");
  }

  goMainPage() {
    this.router.navigate(["/main"]);
  }
}
