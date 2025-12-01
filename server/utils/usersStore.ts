export type User = {
  id: number;
  email: string;
  fullName: string;  // Add this
  password: string;
  createdAt: string;
};

const users: User[] = [];
let nextUserId = 1;

export function findUserByEmail(email: string): User | undefined {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function createUser(email: string, password: string, fullName: string): User {
  const user: User = {
    id: nextUserId++,
    email,
    fullName,
    password,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  return user;
}

export function validateUser(email: string, password: string): User | null {
  const user = findUserByEmail(email);
  if (!user) return null;
  if (user.password !== password) return null;
  return user;
}