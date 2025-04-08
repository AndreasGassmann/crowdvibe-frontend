"use client";

import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from "unique-names-generator";

const STORAGE_KEYS = {
  USERNAME: "username",
  PASSWORD: "password",
  IS_REGISTERED: "is_registered",
  HAS_SET_FIRSTNAME: "hasSetFirstname",
  FIRSTNAME: "firstname",
} as const;

export interface IStorageService {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
  getToken: () => string | null;
  getUsername: () => string | null;
  setUsername: (username: string) => void;
  getPassword: () => string | null;
  setPassword: (password: string) => void;
  getFirstname: () => string | null;
  setFirstname: (firstname: string) => void;
  isRegistered: () => boolean;
  generateRandomPassword: () => string;
  clear: () => void;
  setUserRegistered: (value: boolean) => void;
  isUserRegistered: () => boolean;
  setFirstnameSet: (value: boolean) => void;
  hasSetFirstname: () => boolean;
}

class StorageService implements IStorageService {
  private static instance: StorageService;
  private storage: Storage;
  private username: string | null = null;
  private password: string | null = null;
  private firstname: string | null = null;
  private _isRegistered: boolean | null = null;

  private constructor() {
    this.storage =
      typeof window !== "undefined"
        ? localStorage
        : ({
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
            clear: () => {},
            length: 0,
            key: () => null,
          } as unknown as Storage);

    // Initialize values from localStorage
    this.username = this.storage.getItem(STORAGE_KEYS.USERNAME);
    this.password = this.storage.getItem(STORAGE_KEYS.PASSWORD);
    this.firstname = this.storage.getItem(STORAGE_KEYS.FIRSTNAME);
    this._isRegistered =
      this.storage.getItem(STORAGE_KEYS.IS_REGISTERED) === "true";
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  get(key: string): string | null {
    return this.storage.getItem(key);
  }

  set(key: string, value: string): void {
    this.storage.setItem(key, value);
  }

  remove(key: string): void {
    this.storage.removeItem(key);
  }

  getToken(): string | null {
    return this.get("token");
  }

  getUsername(): string | null {
    if (!this.username) {
      // Generate a human-readable name with capital letters and spaces
      const readableName = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: " ",
        length: 2,
        style: "capital",
      });

      // Set the readable version as firstname
      this.setFirstname(readableName);

      // Create slugified version for username (lowercase with hyphens)
      this.username = readableName.toLowerCase().replace(/\s+/g, "-");
      this.set(STORAGE_KEYS.USERNAME, this.username);
    }
    return this.username;
  }

  setUsername(username: string): void {
    this.username = username;
    this.set(STORAGE_KEYS.USERNAME, username);
  }

  getPassword(): string | null {
    if (!this.password) {
      // Generate a random password if none exists
      this.password = this.generateRandomPassword();
      this.set(STORAGE_KEYS.PASSWORD, this.password);
    }
    return this.password;
  }

  setPassword(password: string): void {
    this.password = password;
    this.set(STORAGE_KEYS.PASSWORD, password);
  }

  getFirstname(): string | null {
    return this.firstname;
  }

  setFirstname(firstname: string): void {
    this.firstname = firstname;
    this.set(STORAGE_KEYS.FIRSTNAME, firstname);
  }

  isRegistered(): boolean {
    if (this._isRegistered === null) {
      this._isRegistered =
        this.storage.getItem(STORAGE_KEYS.IS_REGISTERED) === "true";
    }
    return this._isRegistered || false;
  }

  generateRandomPassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  clear(): void {
    this.username = null;
    this.password = null;
    this.firstname = null;
    this._isRegistered = null;
    this.storage.clear();
  }

  setUserRegistered(value: boolean): void {
    this._isRegistered = value;
    this.set(STORAGE_KEYS.IS_REGISTERED, value.toString());
  }

  isUserRegistered(): boolean {
    return this._isRegistered || false;
  }

  setFirstnameSet(value: boolean): void {
    this.set(STORAGE_KEYS.HAS_SET_FIRSTNAME, value.toString());
  }

  hasSetFirstname(): boolean {
    return this.get(STORAGE_KEYS.HAS_SET_FIRSTNAME) === "true";
  }
}

export const storage = StorageService.getInstance();
