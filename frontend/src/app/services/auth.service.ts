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

@Injectable({
  providedIn: "root",
})
export class AuthService extends BaseService {
  private currentUserSubject = new BehaviorSubject<UserGetDto | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(http: HttpClient) {
    super(http);
    this.apiPath = "auth";
  }

  login(email: string, password: string) {
    const loginDto: LoginDto = { email: email, password: password };
    return this.http.post(enviroment.API_URL+ this.apiPath + "/login", loginDto);
  }

  register(registerDto: RegisterDto) {
    return this.http.post<LoginTokenDto>(enviroment.API_URL+ this.apiPath + "/register", registerDto);
  }

  logout() {
    return this.http.post(enviroment.API_URL+ this.apiPath + "/logout", {});
  }

  refresh() {
    const resfreshTokenDto: RefreshTokenDto = {
      refreshToken: localStorage.getItem("refreshToken") || "",
    };
    return this.http.post(enviroment.API_URL+ this.apiPath + "/refresh", resfreshTokenDto);
  }

  setSessionStorage(loginTokenDto : LoginTokenDto) {
    localStorage.setItem("accessToken", loginTokenDto.accessToken);
    localStorage.setItem("refreshToken", loginTokenDto.refreshToken); //chabge to http cookie
    this.currentUserSubject.next(loginTokenDto.user);
  }
}
