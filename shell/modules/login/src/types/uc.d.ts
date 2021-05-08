declare namespace UC {
  interface VerifiableAddress {
    id: string,
    value: string,
    verified: boolean,
    via: string,
    status: string,
    verified_at: string | null
  }

  interface RecoveryAddress {
    id: string,
    value: string,
    via: string
  }

  interface Identity {
    id: string,
    schema_id: string,
    schema_url: string,
    traits: {
      email: string,
      name: {
        first: string,
        last: string
      }
    },
    verifiable_addresses: VerifiableAddress[],
    recovery_addresses: RecoveryAddress[]
  }

  interface Profile {
    id: string,
    active: boolean,
    expires_at: string,
    authenticated_at: string,
    issued_at: string,
    identity: Identity
  }
}
