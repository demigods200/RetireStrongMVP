import type { User, CreateUserInput, CompleteOnboardingInput } from "../models/User";
import { UserRepo } from "../repos/UserRepo";

export class UserService {
  constructor(private userRepo: UserRepo) {}

  async createUser(input: CreateUserInput): Promise<User> {
    // Validate input
    if (!input.email || !input.firstName || !input.lastName) {
      throw new Error("Missing required fields: email, firstName, lastName");
    }

    // Check if user already exists
    const existing = await this.userRepo.getUserById(input.userId);
    if (existing) {
      throw new Error("User already exists");
    }

    // Create user
    return await this.userRepo.createUser(input);
  }

  async getUserById(userId: string): Promise<User | null> {
    return await this.userRepo.getUserById(userId);
  }

  async completeOnboarding(input: CompleteOnboardingInput): Promise<User> {
    // Validate input
    if (!input.onboardingData) {
      throw new Error("Missing onboarding data");
    }

    // Get existing user
    const user = await this.userRepo.getUserById(input.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update user with onboarding data
    const updatedUser: User = {
      ...user,
      onboardingData: input.onboardingData,
      onboardingComplete: true,
      updatedAt: new Date().toISOString(),
    };

    // Save updated user
    await this.userRepo.updateUser(updatedUser);

    return updatedUser;
  }
}

