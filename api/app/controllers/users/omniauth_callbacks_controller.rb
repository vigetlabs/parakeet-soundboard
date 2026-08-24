class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  skip_before_action :verify_authenticity_token, raise: false

  def google_oauth2
    user = User.from_omniauth(request.env["omniauth.auth"])
    sign_in(user)

    token = request.env["warden-jwt_auth.token"]
    refresh_token = user.refresh_tokens.create!

    redirect_to "#{ENV.fetch('FRONTEND_URL')}/auth/callback" \
      "#token=#{token}&refresh_token=#{refresh_token.token}",
      allow_other_host: true
  end

  def failure
    redirect_to "#{ENV.fetch('FRONTEND_URL')}/login?error=sso_failed",
      allow_other_host: true
  end
end
