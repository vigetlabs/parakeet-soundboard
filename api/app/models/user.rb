class User < ApplicationRecord
  class UnverifiedEmailConflict < StandardError; end
  class UntrustedGoogleAccount < StandardError; end

  GMAIL_DOMAIN = "gmail.com"
  private_constant :GMAIL_DOMAIN

  include Devise::JWT::RevocationStrategies::JTIMatcher
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, :omniauthable,
         jwt_revocation_strategy: self,
         omniauth_providers: [ :google_oauth2 ]

  validates :email, presence: true, uniqueness: true
  validates :username, presence: true, uniqueness: true
  has_many :sounds
  has_many :folders
  has_many :refresh_tokens, dependent: :delete_all
  has_one :favorite_folder, -> { where(is_favorite: true) }, class_name: "Folder"
  after_create :create_favorites_folder

  def create_favorites_folder
    folders.create!(name: "Favorites", is_favorite: true)
  end

  def self.from_omniauth(auth)
    user = find_by(provider: auth.provider, uid: auth.uid)
    return user if user

    existing = find_by(email: auth.info.email)

    unless trusted_google_account?(auth)
      raise UnverifiedEmailConflict if existing
      raise UntrustedGoogleAccount
    end

    if existing
      existing.update!(provider: auth.provider, uid: auth.uid)
      return existing
    end

    create!(
      email: auth.info.email,
      username: unique_placeholder_username(auth.info.email),
      provider: auth.provider,
      uid: auth.uid,
      password: Devise.friendly_token[0, 20],
      needs_username: true
    )
  end

  # A Google account is only trustworthy enough to sign in or claim a
  # local account when Google is actually authoritative over the email
  # address: gmail.com addresses always are, and custom domains only are
  # while they're actively managed by Google Workspace (a live `hd`
  # claim) - `email_verified` alone can be stale for a domain that has
  # since moved off Google. See https://developers.google.com/identity/sign-in/android/backend-auth#verify-the-integrity-of-the-id-token
  def self.trusted_google_account?(auth)
    email = auth.info.email.to_s.downcase
    return true if email.end_with?("@#{GMAIL_DOMAIN}")

    raw_info = auth.extra&.raw_info
    raw_info&.[]("email_verified") && raw_info&.[]("hd").present?
  end
  private_class_method :trusted_google_account?

  def self.unique_placeholder_username(email)
    base = email.split("@").first
    username = base
    suffix = 1

    while exists?(username: username)
      suffix += 1
      username = "#{base}#{suffix}"
    end

    username
  end
  private_class_method :unique_placeholder_username
end
