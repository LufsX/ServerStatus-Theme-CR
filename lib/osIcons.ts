import {
  siAlmalinux, siAlpinelinux, siApple, siArchlinux, siCentos,
  siDebian, siFedora, siFreebsd, siGentoo, siKalilinux, siLinux,
  siLinuxmint, siNixos, siOpenbsd, siOpensuse, siRaspberrypi,
  siRedhat, siRockylinux, siSuse, siUbuntu,
  type SimpleIcon,
} from "simple-icons";
import { faWindows } from "@fortawesome/free-brands-svg-icons/faWindows";

export interface OSLogo {
  title: string;
  path: string;
  viewBox: string;
}

function logo(icon: SimpleIcon): OSLogo {
  return { title: icon.title, path: icon.path, viewBox: "0 0 24 24" };
}

// Match distributions before generic Linux; boundaries avoid matching unrelated names.
const logos: ReadonlyArray<readonly [RegExp, OSLogo]> = [
  [/\b(?:windows|win(?:32|64|7|8|10|11)|microsoft windows)\b/i, {
    title: "Windows",
    path: Array.isArray(faWindows.icon[4]) ? faWindows.icon[4].join(" ") : faWindows.icon[4],
    viewBox: `0 0 ${faWindows.icon[0]} ${faWindows.icon[1]}`,
  }],
  [/\b(?:mac\s?os(?:\s?x)?|os\s?x|darwin)\b/i, logo(siApple)],
  [/\b(?:raspbian|raspberry\s?pi(?:\s?os)?)\b/i, logo(siRaspberrypi)],
  [/\bubuntu\b/i, logo(siUbuntu)],
  [/\bdebian\b/i, logo(siDebian)],
  [/\bcentos\b/i, logo(siCentos)],
  [/\b(?:alma(?:linux)?|alma\s+linux)\b/i, logo(siAlmalinux)],
  [/\brocky(?:linux)?\b/i, logo(siRockylinux)],
  [/\b(?:red\s?hat|rhel)\b/i, logo(siRedhat)],
  [/\bfedora\b/i, logo(siFedora)],
  [/\barch(?:\s?linux)?\b/i, logo(siArchlinux)],
  [/\balpine(?:\s?linux)?\b/i, logo(siAlpinelinux)],
  [/\bopen\s?suse\b/i, logo(siOpensuse)],
  [/\b(?:suse|sles)\b/i, logo(siSuse)],
  [/\bgentoo\b/i, logo(siGentoo)],
  [/\bnix\s?os\b/i, logo(siNixos)],
  [/\bkali(?:\s?linux)?\b/i, logo(siKalilinux)],
  [/\b(?:linux\s?mint|mint)\b/i, logo(siLinuxmint)],
  [/\bfree\s?bsd\b/i, logo(siFreebsd)],
  [/\bopen\s?bsd\b/i, logo(siOpenbsd)],
  [/\blinux\b/i, logo(siLinux)],
];

/** Accept names, os-release IDs, and versioned labels without guessing unknown OSes. */
export function getOSLogo(os: string): OSLogo | undefined {
  const name = os.trim().replace(/[_-]+/g, " ");
  return logos.find(([pattern]) => pattern.test(name))?.[1];
}
