class RefreshTokensController < ApplicationController
  def create
    refresh_token = params[:refresh_token]

    refresh_token_record = RefreshToken.find_by_token(refresh_token)
    return render json: { error: "Invalid refresh token" }, status: :unauthorized unless refresh_token_record

    user = refresh_token_record.user

    new_jwt = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first

    old_refresh_token = refresh_token_record
    new_refresh_token = user.refresh_tokens.create!
    old_refresh_token.destroy!

    render json: {
      access_token: new_jwt,
      refresh_token: new_refresh_token.token
    }
  end
end
