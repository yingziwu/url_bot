interface Account {
  id: string;
  username: string;
  acct: string;
  display_name: string;
  locked: boolean;
  bot: boolean;
  created_at: string;
  note: string;
  url: string;
  avatar: string;
  avatar_static: string;
  header: string;
  header_static: string;
  followers_count: number;
  following_count: number;
  statuses_count: number;
  last_status_at: string;
  emojis: Emoji[];
  fields: Field[];
}

interface Emoji {
  shortcode: string;
  url: string;
  static_url: string;
  visible_in_picker: boolean;
}

interface Field {
  name: string;
  value: string;
  verified_at: string | null;
}

interface FollowResponse {
  id: string;
  following: boolean;
  showing_reblogs: boolean;
  notifying: boolean;
  followed_by: boolean;
  blocking: boolean;
  blocked_by: boolean;
  muting: boolean;
  muting_notifications: boolean;
  requested: boolean;
  domain_blocking: boolean;
  endorsed: boolean;
}

interface Status {
  id: string;
  created_at: string;
  in_reply_to_id: null | string;
  in_reply_to_account_id: null | string;
  sensitive: boolean;
  spoiler_text: string;
  visibility: "public" | "unlisted" | "private" | "direct";
  language: string | null;
  uri: string;
  url: string;
  replies_count: number;
  reblogs_count: number;
  favourites_count: number;
  favourited: boolean;
  reblogged: boolean;
  muted: boolean;
  bookmarked: boolean;
  content: string;
  reblog: null;
  application: {
    name: string;
    website: null | string;
  };
  account: Account;
  media_attachments: Attachment[];
  mentions: Mention[];
  tags: Tag[];
  emojis: Emoji[];
  card: null | Card;
  poll: null | Poll;
}

interface Attachment {
  id: string;
  type: "unknown" | "image" | "gifv" | "video" | "audio";
  url: string;
  preview_url: string;
  remote_url: string | null;
  description: string | null;
  blurhash: string | null;
  text_url: string;
  meta: object;
}

interface Mention {
  id: string;
  username: string;
  url: string;
  acct: string;
}

interface Tag {
  name: string;
  url: string;
  history: TagHistory[];
}

interface TagHistory {
  day: string;
  uses: string;
  accounts: string;
}

interface Card {
  url: string;
  title: string;
  description: string;
  type: string;
  author_name: string;
  author_url: string;
  provider_name: string;
  provider_url: string;
  html: string;
  width: number;
  height: number;
  image: null;
  embed_url: string;
}

interface Poll {
  id: string;
  expires_at: string;
  expired: boolean;
  multiple: boolean;
  votes_count: number;
  voters_count: null | number;
  voted: boolean;
  own_votes: number[] | null;
  options: PollOption[];
  emojis: Emoji[];
}

interface PollOption {
  title: "accept";
  votes_count: 6;
}

interface Notification {
  id: string;
  type:
    | "follow"
    | "follow_request"
    | "mention"
    | "reblog"
    | "favourite"
    | "poll"
    | "status";
  created_at: string;
  account: Account;
  status?: Status;
}

interface ScheduledStatus {
  id: string;
  scheduled_at: string;
  params: {
    text: string;
    media_ids: string[];
    sensitive: boolean;
    spoiler_text: string;
    visibility: "public" | "unlisted" | "private" | "direct";
    scheduled_at: string;
    poll: null;
    idempotency: null | string;
    in_reply_to_id: string | null;
    application_id: number;
  };
  media_attachments: string[];
}
