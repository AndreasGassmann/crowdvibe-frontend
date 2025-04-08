"use client";

const STORAGE_KEYS = {
  USERNAME: "username",
  PASSWORD: "password",
  IS_REGISTERED: "is_registered",
  HAS_SET_FIRSTNAME: "hasSetFirstname",
} as const;

const isBrowser = typeof window !== "undefined";

class StorageService {
  private static instance: StorageService;
  private username: string | null = null;
  private password: string | null = null;
  private isRegistered: boolean | null = null;

  private constructor() {
    if (isBrowser) {
      // Initialize values from localStorage
      this.username = localStorage.getItem(STORAGE_KEYS.USERNAME);
      this.password = localStorage.getItem(STORAGE_KEYS.PASSWORD);
      this.isRegistered =
        localStorage.getItem(STORAGE_KEYS.IS_REGISTERED) === "true";
    }
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private generateRandomPassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  public getUsername(): string {
    if (!this.username) {
      // Generate a random username if none exists
      this.username = `user_${Math.random().toString(36).slice(-6)}`;
      if (isBrowser) {
        localStorage.setItem(STORAGE_KEYS.USERNAME, this.username);
      }
    }
    return this.username;
  }

  public getPassword(): string {
    if (!this.password) {
      // Generate a random password if none exists
      this.password = this.generateRandomPassword();
      if (isBrowser) {
        localStorage.setItem(STORAGE_KEYS.PASSWORD, this.password);
      }
    }
    return this.password;
  }

  public setCredentials(username: string, password: string): void {
    this.username = username;
    this.password = password;
    if (isBrowser) {
      localStorage.setItem(STORAGE_KEYS.USERNAME, username);
      localStorage.setItem(STORAGE_KEYS.PASSWORD, password);
    }
  }

  public clearCredentials(): void {
    this.username = null;
    this.password = null;
    this.isRegistered = null;
    if (isBrowser) {
      localStorage.removeItem(STORAGE_KEYS.USERNAME);
      localStorage.removeItem(STORAGE_KEYS.PASSWORD);
      localStorage.removeItem(STORAGE_KEYS.IS_REGISTERED);
    }
  }

  public hasCredentials(): boolean {
    return !!this.username && !!this.password;
  }

  public isUserRegistered(): boolean {
    if (this.isRegistered === null) {
      this.isRegistered =
        isBrowser &&
        localStorage.getItem(STORAGE_KEYS.IS_REGISTERED) === "true";
    }
    return this.isRegistered || false;
  }

  public setUserRegistered(value: boolean): void {
    this.isRegistered = value;
    if (isBrowser) {
      localStorage.setItem(STORAGE_KEYS.IS_REGISTERED, value.toString());
    }
  }

  public hasSetFirstname(): boolean {
    if (isBrowser) {
      return localStorage.getItem(STORAGE_KEYS.HAS_SET_FIRSTNAME) === "true";
    }
    return false;
  }

  public setFirstnameSet(hasSet: boolean): void {
    if (isBrowser) {
      localStorage.setItem(STORAGE_KEYS.HAS_SET_FIRSTNAME, hasSet.toString());
    }
  }
}

export const storage = StorageService.getInstance();
