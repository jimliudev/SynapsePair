/// SynapsePair on-chain records for subscriptions and chat rooms.
/// Deployed on Sui testnet.
module synapse_pair::synapse_pair {
    use sui::coin::Coin;
    use sui::sui::SUI;
    use sui::clock::Clock;
    use sui::event;
    use std::string;

    // ─── Structs ──────────────────────────────────────────────────────────────

    /// On-chain subscription record minted to the user's wallet.
    public struct Subscription has key, store {
        id: UID,
        owner: address,
        skill_id: u64,
        skill_name: string::String,
        price_paid: u64,       // in MIST
        subscribed_at: u64,    // epoch ms
        expires_at: u64,       // epoch ms (+30 days)
    }

    /// On-chain chat room record owned by the creator.
    public struct ChatRoom has key, store {
        id: UID,
        owner: address,
        name: string::String,
        slug: string::String,
        created_at: u64,
        is_public: bool,
    }

    /// On-chain pointer to a skill whose metadata lives on Walrus.
    public struct Skill has key, store {
        id: UID,
        owner: address,
        skill_id: u64,
        price: u64,           // MIST per subscription
        blob_id: string::String, // Walrus blob ID → full JSON metadata
        active: bool,
        created_at: u64,
    }

    // ─── Events ───────────────────────────────────────────────────────────────

    public struct SubscriptionCreated has copy, drop {
        subscription_id: address,
        owner: address,
        skill_id: u64,
    }

    public struct RoomCreated has copy, drop {
        room_object_id: address,
        owner: address,
        slug: string::String,
    }

    public struct SkillPublished has copy, drop {
        skill_object_id: address,
        owner: address,
        skill_id: u64,
        blob_id: string::String,
        price: u64,
    }

    // ─── Entry Functions ──────────────────────────────────────────────────────

    /// Subscribe to a skill.
    /// `payment` is transferred back to the sender on testnet (no treasury yet).
    /// On mainnet, route to a treasury Cap or split to protocol/creator.
    public entry fun subscribe(
        skill_id: u64,
        skill_name: vector<u8>,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let price_paid = payment.value();

        // Testnet: return payment to sender to keep testing free.
        // TODO: replace with actual treasury transfer before mainnet.
        transfer::public_transfer(payment, ctx.sender());

        let now = clock.timestamp_ms();
        let sub = Subscription {
            id: object::new(ctx),
            owner: ctx.sender(),
            skill_id,
            skill_name: string::utf8(skill_name),
            price_paid,
            subscribed_at: now,
            expires_at: now + 2_592_000_000, // 30 days in ms
        };

        event::emit(SubscriptionCreated {
            subscription_id: object::uid_to_address(&sub.id),
            owner: ctx.sender(),
            skill_id,
        });

        transfer::transfer(sub, ctx.sender());
    }

    /// Create a multiplayer AI chat room.
    public entry fun create_room(
        name: vector<u8>,
        slug: vector<u8>,
        is_public: bool,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let now = clock.timestamp_ms();
        let room = ChatRoom {
            id: object::new(ctx),
            owner: ctx.sender(),
            name: string::utf8(name),
            slug: string::utf8(slug),
            created_at: now,
            is_public,
        };

        event::emit(RoomCreated {
            room_object_id: object::uid_to_address(&room.id),
            owner: ctx.sender(),
            slug: string::utf8(slug),
        });

        transfer::transfer(room, ctx.sender());
    }

    /// Publish a skill. Full metadata JSON is stored on Walrus; only the
    /// blob_id pointer and pricing live on-chain.
    public entry fun publish_skill(
        skill_id: u64,
        price: u64,
        blob_id: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let blob_id_str = string::utf8(blob_id);
        let skill = Skill {
            id: object::new(ctx),
            owner: ctx.sender(),
            skill_id,
            price,
            blob_id: blob_id_str,
            active: true,
            created_at: clock.timestamp_ms(),
        };

        event::emit(SkillPublished {
            skill_object_id: object::uid_to_address(&skill.id),
            owner: ctx.sender(),
            skill_id,
            blob_id: string::utf8(blob_id),
            price,
        });

        transfer::transfer(skill, ctx.sender());
    }
}
