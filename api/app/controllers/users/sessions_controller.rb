# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  respond_to :json
  before_action :authenticate_user!, only: [ :show ]

  def respond_with(current_user, _opts = {})
    refresh_token = current_user.refresh_tokens.create!
    render json: {
      status: {
        code: 200, message: "Logged in successfully.",
        data: {
          user: UserSerializer.new(current_user).serializable_hash[:data][:attributes],
          refresh_token: refresh_token.token
        }
      }
    }, status: :ok
  end
  def respond_to_on_destroy
    if request.headers["Authorization"].present?
      jwt_payload = JWT.decode(request.headers["Authorization"].split(" ").last, ENV.fetch("DEVISE_JWT_SECRET_KEY")).first
      current_user = User.find_by(id: jwt_payload["sub"], jti: jwt_payload["jti"])

      current_user.refresh_tokens.destroy_all if current_user
    end

    if current_user
      render json: {
        status: 200,
        message: "Logged out successfully."
      }, status: :ok
    else
      render json: {
        status: 401,
        message: "Couldn't find an active session."
      }, status: :unauthorized
    end
  end

  def show
    if current_user
      render json: {
        email: current_user.email,
        username: current_user.username,
        id: current_user.id
      }, status: :ok
    else
      render json: { status: 401, message: "Invalid or expired token." }, status: :unauthorized
    end
  end
end
