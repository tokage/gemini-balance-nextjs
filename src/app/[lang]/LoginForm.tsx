"use client";

import { login } from "@/app/auth/actions";
import { Dictionary } from "@/lib/dictionaries";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type FormState = {
  error?: string;
};

function SubmitButton({ dictionary }: { dictionary: Dictionary["loginForm"] }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
    >
      {pending ? dictionary.signingIn : dictionary.signIn}
    </button>
  );
}

export default function LoginForm({
  dictionary,
}: {
  dictionary: Dictionary["loginForm"];
}) {
  const [state, formAction] = useActionState<FormState, FormData>(login, {});

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          {dictionary.title}
        </h1>
        <form action={formAction} className="space-y-6">
          <div>
            <label
              htmlFor="token"
              className="block text-sm font-medium text-gray-700"
            >
              {dictionary.tokenLabel}
            </label>
            <input
              id="token"
              name="token"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          <div>
            <SubmitButton dictionary={dictionary} />
          </div>
        </form>
      </div>
    </div>
  );
}
