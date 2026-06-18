# Trace — V1 Flow Diagrams

**Product:** Trace · personal life-logging web application  
**Version:** V1 · multi-user · hosted MERN  
**Spec reference:** `V1-Requirements-Specification.md` v0.2  
**Diagrams in this document:** 3  

---

## How to use these diagrams

| Audience | Primary diagrams |
|---|---|
| Design (wireframing) | Diagram 1 — User Flow, Diagram 3 — Auth Sub-Flow |
| Development (implementation) | Diagram 2 — Entry Lifecycle, Diagram 3 — Auth Sub-Flow |
| Spec validation | All three — cross-check against FR and NFR IDs |

**Rendering:** every diagram in this file is a fenced Mermaid code block. It renders natively on GitHub, in VS Code with the Mermaid Preview extension, and at [mermaid.live](https://mermaid.live). The standalone `.mermaid` files in this directory can be imported directly into Figma plugins that support Mermaid.

---

## Shape legend

| Shape | Meaning |
|---|---|
| `([text])` | Start / end (stadium) |
| `[text]` | Screen or action |
| `{text}` | Decision / branch |
| Subgraph box | Logical zone grouping related steps |
| State oval | State (stateDiagram-v2) |
| `[*]` | Entry / exit point (stateDiagram-v2) |

---

## Diagram 1 — User Flow

**What it shows:** every user journey through the app, from first browser request to session end. Use this when designing wireframes to ensure every screen has a path in and a path out, and that the capture loop is visually central.

**Key design decisions encoded here:**
- The capture loop is the product's heartbeat — it is separate from but always reachable from the core screen.
- Search is triggered by ⌘K, keeping the surface keyboard-first (NFR-7.1).
- Soft-delete always requires confirmation before proceeding.
- Account deletion is a two-step, irreversible action with a separate confirm screen.

```mermaid
flowchart TD

    %% ── Entry point ─────────────────────────────────────────────────────────
    START([Open Trace in browser]) --> SESS{Active\nsession?}

    SESS -->|Yes| HOME
    SESS -->|No| LOGIN

    %% ── Authentication zone ─────────────────────────────────────────────────
    subgraph AUTHZONE[" Authentication "]
        direction LR
        LOGIN[Login]
        REGISTER[Register]
        RESETPW[Reset Password]

        LOGIN     -->|New account| REGISTER
        REGISTER  -->|Account created| LOGIN
        LOGIN     -->|Forgot password| RESETPW
        RESETPW   -->|Reset link sent| LOGIN
    end

    LOGIN -->|Authenticated · JWT issued| HOME

    %% ── Core screen ─────────────────────────────────────────────────────────
    HOME["● Capture + Timeline<br/>─────────────────────────<br/>Capture input auto-focused on load<br/>Entries grouped by day · newest first"]

    %% ── Core capture loop ───────────────────────────────────────────────────
    subgraph CORELOOP[" Core capture loop "]
        direction LR
        TYPE["Write a moment"]
        COMMIT["Entry saved<br/>auto-timestamped"]
        TYPE   -->|"Enter"| COMMIT
        COMMIT -->|"Cursor returns to input"| TYPE
    end

    HOME --> TYPE

    %% ── Entry actions ───────────────────────────────────────────────────────
    HOME -->|Select an entry| EACT{Entry<br/>actions}

    EACT -->|Edit body text| HOME
    EACT -->|Adjust occurrence time| HOME
    EACT -->|Soft-delete| SDCFM{Confirm<br/>delete?}

    SDCFM -->|"Yes — hidden, recoverable"| HOME
    SDCFM -->|Cancel| EACT

    %% ── Search & filter ─────────────────────────────────────────────────────
    HOME -->|"⌘K  open search"| SEARCH["Search + Filter<br/>─────────────────────────<br/>Full-text query<br/>#tag filter · Date range"]

    SEARCH -->|Select result| HOME
    SEARCH -->|Dismiss| HOME

    %% ── Tag index ───────────────────────────────────────────────────────────
    HOME -->|Tag index| TAGIDX["Tag Index<br/>─────────────────────────<br/>All #tags · entry count per tag"]

    TAGIDX -->|"Select tag → filtered view"| SEARCH
    TAGIDX -->|Back| HOME

    %% ── Settings + export ───────────────────────────────────────────────────
    HOME -->|Settings| SETT["Settings + Export<br/>─────────────────────────<br/>Export · Theme · Account"]

    SETT -->|"Export corpus → Markdown or JSON"| SETT
    SETT -->|Toggle light / dark theme| SETT
    SETT -->|Delete account + all data| DELCFM{"Permanent delete?<br/>No undo."}

    DELCFM -->|"Yes — all data erased"| END
    DELCFM -->|Cancel| SETT
    SETT -->|Log out| END

    %% ── Terminus ────────────────────────────────────────────────────────────
    END(["Session ended"])
```

**Spec coverage check**

| Requirement | Covered by |
|---|---|
| FR-1.1 Input auto-focused on load | `HOME` node label |
| FR-1.2 Automatic timestamping | `COMMIT` node |
| FR-1.3 Keyboard commit (Enter) | `TYPE → COMMIT` edge label |
| FR-2.2 Soft delete | `EACT → SDCFM → HOME` path |
| FR-3.1/3.2 Timeline, day groups | `HOME` node label |
| FR-4.1 Full-text search | `SEARCH` node |
| FR-4.2/4.3 Tag + date filter | `SEARCH` node |
| FR-5.1/5.2 Tag index | `TAGIDX` node |
| FR-6.1/6.2 Export MD + JSON | `SETT` self-loop |
| FR-7.1/7.2/7.3 Auth flows | `AUTHZONE` subgraph |
| FR-7.6 Account deletion | `SETT → DELCFM → END` path |
| NFR-7.1 Keyboard-first | ⌘K label on search edge |

---

## Diagram 2 — Entry Lifecycle

**What it shows:** the complete state machine for a single Entry document — from the moment a user starts typing through all possible mutations and deletion states. Use this when implementing the backend model and when designing the inline entry interaction patterns in the wireframes.

**Key design decisions encoded here:**
- `createdAt` is set exactly once at commit and is never mutable — this is the immutable ledger principle from the spec (FR-2.3).
- `occurredAt` is separately editable at any time, enabling backdating (FR-1.5).
- Soft-delete is reversible; there is no hard delete in V1 (FR-2.2, NFR-2.3).
- Draft text lives only on the client until Enter is pressed; it is recoverable on restart (NFR-2.2).

```mermaid
stateDiagram-v2

    %% ── Draft ───────────────────────────────────────────────────────────────
    [*] --> Draft : User starts typing

    Draft --> Draft     : Shift+Enter — insert newline
    Draft --> Committed : Enter — createdAt set (immutable)
    Draft --> [*]       : Discard — draft text recoverable on restart

    %% ── Committed ───────────────────────────────────────────────────────────
    Committed --> Committed   : Edit body text — updatedAt refreshed
    Committed --> Committed   : Adjust occurredAt — backdate event
    Committed --> SoftDeleted : Soft-delete — deleted=true · hidden from timeline

    %% ── SoftDeleted ─────────────────────────────────────────────────────────
    SoftDeleted --> Committed : Restore — deleted=false · re-appears in timeline

    %% ── Annotations ─────────────────────────────────────────────────────────
    note right of Draft
        Text is held as in-progress input.
        Not yet written to the database.
        Recoverable on app restart (NFR-2.2).
    end note

    note right of Committed
        createdAt is set once on commit and never changes.
        occurredAt is the primary analysis axis — editable.
        updatedAt refreshes whenever body or occurredAt changes.
        body is Markdown-friendly plain text.
        tags are parsed from inline #hashtags.
    end note

    note right of SoftDeleted
        The document persists in MongoDB (deleted=true).
        Hidden from all timeline and search views.
        Restorable at any time.
        Hard delete is out of scope for V1.
    end note
```

**MongoDB schema alignment**

| State | `deleted` | `createdAt` | `occurredAt` | `updatedAt` |
|---|---|---|---|---|
| Draft | — (not in DB) | — | — | — |
| Committed | `false` | Set once, immutable | Editable | Refreshed on edit |
| SoftDeleted | `true` | Unchanged | Unchanged | Set at soft-delete |

---

## Diagram 3 — Authentication Sub-Flow

**What it shows:** the detailed paths through the authentication system — login, registration, and password reset — including all error branches. Use this when designing the auth screens in the wireframes and when implementing the auth endpoints.

**Key design decisions encoded here:**
- Password reset email response is the same regardless of whether the email is registered, preventing account enumeration attacks (NFR-4.4).
- Rate limiting on login attempts is noted on the error node (NFR-4.5).
- Registration immediately issues a JWT — no separate email verification step in V1.
- Old sessions are invalidated when a password is reset.

```mermaid
flowchart TD

    %% ── Entry point ─────────────────────────────────────────────────────────
    UNAUTH([Unauthenticated user]) --> ACTION{First step}

    ACTION -->|Have an account| LOGINFORM
    ACTION -->|New to Trace| REGFORM

    %% ── Login path ──────────────────────────────────────────────────────────
    LOGINFORM["Login<br/>─────────────────────────<br/>Email + Password"]

    LOGINFORM --> LOGINVAL{Credentials<br/>valid?}

    LOGINVAL -->|Yes| JWT_OK["JWT issued<br/>Session started"]
    JWT_OK --> APP

    LOGINVAL -->|"Wrong password / email"| LOGINERR["Error: invalid credentials<br/>Rate-limited after repeated failures"]
    LOGINERR --> LOGINFORM

    LOGINVAL -->|Account not found| NOTFOUND["Error: no account with that email"]
    NOTFOUND --> ACTION

    %% ── Forgot password path ────────────────────────────────────────────────
    LOGINFORM -->|Forgot password| RESETREQ["Enter registered email"]

    RESETREQ --> RESENTSENT{Email<br/>recognised?}

    RESENTSENT -->|Yes| RESETLINK["Reset link sent<br/>Link expires after 1 hour"]
    RESENTSENT -->|"No — same response shown<br/>(prevents enumeration)"| RESETLINK

    RESETLINK -->|User clicks link in email| NEWPWFORM["Set new password<br/>─────────────────────────<br/>New password + Confirm"]

    NEWPWFORM --> NEWPWVAL{Password<br/>valid?}
    NEWPWVAL -->|Yes| PWUPDATED["Password updated<br/>Old sessions invalidated"]
    PWUPDATED --> LOGINFORM
    NEWPWVAL -->|"Too weak or mismatch"| NEWPWFORM

    %% ── Registration path ───────────────────────────────────────────────────
    REGFORM["Register<br/>─────────────────────────<br/>Email + Password + Confirm"]

    REGFORM --> REGVAL{Inputs<br/>valid?}

    REGVAL -->|Email taken| EMAILTAKEN["Error: email already registered<br/>Log in or reset your password"]
    EMAILTAKEN --> ACTION

    REGVAL -->|"Validation fails<br/>(weak password or mismatch)"| REGFORM

    REGVAL -->|"Email free + inputs valid"| REGDONE["Account created<br/>JWT issued · Session started"]
    REGDONE --> APP

    %% ── Success terminus ────────────────────────────────────────────────────
    APP(["Authenticated — Capture + Timeline"])
```

**Spec coverage check**

| Requirement | Covered by |
|---|---|
| FR-7.1 Registration | `REGFORM → REGVAL → REGDONE` path |
| FR-7.2 Authentication required | `UNAUTH` start node, JWT gates |
| FR-7.3 Session management + logout | JWT issue on success nodes |
| FR-7.5 Credential recovery | `LOGINFORM → RESETREQ → RESETLINK → NEWPWFORM` |
| NFR-4.1 HTTPS/TLS | Implied; enforced at infrastructure level |
| NFR-4.2 Salted password hash | Implied; enforced at implementation level |
| NFR-4.4 No account enumeration | `RESENTSENT` — same response regardless |
| NFR-4.5 Rate limiting | `LOGINERR` node label |

---

## Deferred diagrams (V2+)

These diagrams are explicitly out of scope for V1 but should be created before building those features:

| Diagram | Trigger |
|---|---|
| Analysis + insights flow | When the pattern engine is added |
| Multi-device sync flow | When offline/sync is implemented |
| Admin / operator flow | When operator controls are needed |
| Data export + re-import flow | If FR-6.4 (import) is promoted to Must |

---

*Source files: `trace-user-flow.mermaid` · `trace-entry-lifecycle.mermaid` · `trace-auth-flow.mermaid`*
