export type Profile = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  skills: string;
  languages: string;
};

const KEY = "workwise-profile";

export const emptyProfile = (): Profile => ({
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  portfolio: "",
  summary: "",
  skills: "",
  languages: "",
});

export function loadProfile(): Profile {
  if (typeof window === "undefined") return emptyProfile();
  try {
    return { ...emptyProfile(), ...JSON.parse(window.localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return emptyProfile();
  }
}

export function saveProfile(p: Profile) {
  window.localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("workwise-profile-updated"));
}

export function profileIsEmpty(p: Profile) {
  return !Object.values(p).some((v) => v.trim() !== "");
}
