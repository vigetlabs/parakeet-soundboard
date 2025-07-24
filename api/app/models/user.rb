class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, :omniauthable,
         jwt_revocation_strategy: self,
         omniauth_providers: [:google_oauth2]

  # validates :email, presence: true, uniqueness: true
  # validates :username, presence: true, uniqueness: true
  has_many :sounds

  def self.from_omniauth(auth)
    find_or_create_by!(email: auth.info.email) do |user|
      user.uid = auth.uid
      user.provider = 'google'
      user.password = Devise.friendly_token[0, 20]
    end
  end
end
