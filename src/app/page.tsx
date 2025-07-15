import LoginForm from "./LoginForm";

export default function Home() {
  // This page should now only render the login form.
  // All authentication checks and redirects are handled by middleware
  // and the /admin layout.
  return <LoginForm />;
}
