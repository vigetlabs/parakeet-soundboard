class RefreshTokensController < ApplicationController
  def refresh_jwt
    refresh_token = params[:refresh_token]

    refresh_token_record = RefreshToken.find_by_token(refresh_token)
    return render json: { error: "Invalid refresh token" }, status: :unauthorized unless refresh_token_record

    user = refresh_token_record.user

    new_jwt = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first

    render json: {
      access_token: new_jwt,
      refresh_token: refresh_token
    }
  end
end
