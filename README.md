# BIGDROPS Platform Office (Admin)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Bun](https://img.shields.io/badge/Bun-1.0-white?style=flat-square&logo=bun&logoColor=black)](https://bun.sh/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)](LICENSE)

---

## Overview

This repository contains the **BIGDROPS Platform Office** — a dedicated, high-density Operations Console (NOC) for managing and operating the multi-tenant BIGDROPS SaaS engine.

It is designed as an isolated **SaaS control plane**, running independently of the core customer-facing ERP client application, sharing only the underlying Supabase backend and authentication pool while enforcing strict data segregation.

---

## Table of Contents

- [Architectural Separation of Concerns](#architectural-separation-of-concerns)
- [Core Responsibilities](#core-responsibilities)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Security & Operator Safeguards](#security--operator-safeguards)
- [License](#license)

---

## Architectural Separation of Concerns

The Platform Office and the ERP are separate frontend applications that share the same Supabase backend database and authentication pool, but enforce complete segregation of operational duties and data visibility.
