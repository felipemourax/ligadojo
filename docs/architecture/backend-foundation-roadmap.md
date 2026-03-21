# Backend Foundation Roadmap

## Objective

Create the minimum backend foundation that avoids rework across:

- authentication
- tenant resolution
- multi-academy users
- invite flow
- self-signup flow

## Sequence

1. `prisma/schema.prisma`
2. `iam`
3. `tenancy`
4. `academy-memberships`
5. `invitations`
6. `enrollment-requests`

## First Real Backend Deliverables

### 1. Prisma

- install Prisma dependencies
- run `prisma init`
- apply the schema already created in [`prisma/schema.prisma`](/Users/felipemoura/Desktop/Saas%20Academia/prisma/schema.prisma)
- create first migration

### 2. Nest bootstrap

- create real Nest app in [`apps/api/src`](/Users/felipemoura/Desktop/Saas%20Academia/apps/api/src)
- convert placeholder files into real modules
- wire Prisma module and config module

### 3. Real flows

Implement in order:

- resolve tenant by host
- create/login user
- list memberships for a user
- accept invitation
- submit enrollment request
- approve enrollment request

## Rule

Do not start `students`, `classes`, or `finance` backend before the flows above exist.
