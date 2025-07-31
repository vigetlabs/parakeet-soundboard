class SoundsController < ApplicationController
  before_action :authenticate_user!, except: [ :index, :show ]
  before_action :authorize_user!, only: [ :update, :destroy ]
  before_action :set_current_user, only: [ :index, :show ]

  def index
    if current_user
      sounds = Sound.where(user_id: nil).or(Sound.where(user: current_user))
    else
      sounds = Sound.where(user_id: nil)
    end
    render json: SoundSerializer.new(sounds, params: { scope: current_user }).serializable_hash.to_json
  end

  def my_sounds
    sounds = current_user.sounds
    render json: SoundSerializer.new(sounds, params: { scope: current_user }).serializable_hash.to_json
  end

  def show
    if sound.user_id.nil? || (sound.user == current_user)
      render json: SoundSerializer.new(sound, params: { scope: current_user }).serializable_hash.to_json
    else
      render json: { error: "Not authorized" }, status: :forbidden
    end
  end

  def create
    sound = Sound.new(sound_params)
    sound.user = current_user if user_signed_in?
    sound.audio_file.attach(sound_params[:audio_file])
    sound.tag_ids = sound_params[:tag_ids] if sound_params[:tag_ids]
    if sound.save
      render json: SoundSerializer.new(sound,  params: { scope: current_user }).serializable_hash.to_json, status: :created
    else
      render json: { errors: sound.errors }, status: :unprocessable_entity
    end
  end

  def update
    if sound.update(sound_params)
      render json: SoundSerializer.new(sound,  params: { scope: current_user }).serializable_hash.to_json
    else
      render json: { errors: sound.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    sound.destroy
    head :no_content
  end

  private

  def sound
    @sound ||= Sound.find(params[:id])
  end

  def sound_params
    params.require(:sound).permit(:name, :audio_file, :color, :emoji, tag_ids: [])
  end

  def authorize_user!
    if sound.user.present? && sound.user != current_user
      render json: { error: "Not authorized" }, status: :forbidden
    end
  end

  def set_current_user
    request.env["warden"].authenticate(scope: :user)
  end
end
