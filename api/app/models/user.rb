class User < ApplicationRecord
  class UnverifiedEmailConflict < StandardError; end

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

    email_verified = auth.extra&.raw_info&.[]("email_verified")
    existing = find_by(email: auth.info.email)

    if existing
      raise UnverifiedEmailConflict unless email_verified

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
