import test from 'node:test';
import assert from 'node:assert/strict';
import { getOSLogo } from '../lib/osIcons.ts';

const cases = [
  [' Ubuntu 24.04 LTS ', 'Ubuntu'],
  ['Debian GNU/Linux 12 (bookworm)', 'Debian'],
  ['CentOS Stream 9', 'CentOS'],
  ['AlmaLinux 9.5', 'AlmaLinux'],
  ['alma-linux', 'AlmaLinux'],
  ['Rocky Linux 9', 'Rocky Linux'],
  ['Red Hat Enterprise Linux 9', 'Red Hat'],
  ['rhel', 'Red Hat'],
  ['Fedora Linux 41', 'Fedora'],
  ['archlinux', 'Arch Linux'],
  ['Alpine Linux v3.21', 'Alpine Linux'],
  ['openSUSE Leap 15.6', 'openSUSE'],
  ['SLES 15', 'SUSE'],
  ['Gentoo Linux', 'Gentoo'],
  ['NixOS 24.11', 'NixOS'],
  ['Kali GNU/Linux', 'Kali Linux'],
  ['linuxmint', 'Linux Mint'],
  ['Raspberry Pi OS (Debian)', 'Raspberry Pi'],
  ['raspbian', 'Raspberry Pi'],
  ['FreeBSD 14.2', 'FreeBSD'],
  ['OpenBSD 7.6', 'OpenBSD'],
  ['GNU/Linux', 'Linux'],
  ['Windows Server 2022', 'Windows'],
  ['win11', 'Windows'],
  ['macOS 15', 'Apple'],
  ['Mac OS X', 'Apple'],
  ['darwin', 'Apple'],
];

for (const [name, title] of cases) {
  test(`OS logo: ${name}`, () => {
    const logo = getOSLogo(name);
    assert.equal(logo?.title, title);
    assert.ok(logo.path.length > 0);
    assert.match(logo.viewBox, /^0 0 \d+ \d+$/);
  });
}

test('unknown and empty OS names fall back rather than guessing', () => {
  for (const name of ['', '  ', 'unknown', 'Darwinian', 'archipelago', 'my-custom-os']) {
    assert.equal(getOSLogo(name), undefined);
  }
});

test('different distributions have different logo paths', () => {
  assert.notEqual(getOSLogo('ubuntu').path, getOSLogo('debian').path);
  assert.notEqual(getOSLogo('windows').path, getOSLogo('linux').path);
});
