class FoldersController < ApplicationController
  # before_action :authenticate_user!, except: [:index, :show]
  before_action :authorize_user!, only: [ :update, :destroy ]


  # GET /folders
  def index
    folders = Folder.all
    render json: FolderSerializer.new(folders).serializable_hash.to_json
  end

  # GET /my_folders
  def my_folders
    authenticate_user!
    folders = current_user.folders
    render json: FolderSerializer.new(folders).serializable_hash.to_json
  end

  # GET /folders/:id
  def show
    render json: FolderSerializer.new(folder).serializable_hash.to_json
  end

  # POST /folders
  def create
    folder = Folder.new(folder_params)
    folder.user = current_user if user_signed_in?

    if folder.save
      render json: FolderSerializer.new(folder).serializable_hash.to_json, status: :created
    else
      render json: { errors: folder.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH /folders/:id
  def update
    if folder.update(folder_params)
      render json: FolderSerializer.new(folder).serializable_hash.to_json
    else
      render json: { errors: folder.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /folders/:id
  def destroy
    folder.destroy
    head :no_content
  end

  private

  def folder
    @folder ||= Folder.find(params[:id])
  end

  def folder_params
    params.require(:folder).permit(:name, :slug, sound_ids: [])
  end

  def authorize_user!
    if folder.user.present? && folder.user != current_user
      render json: { error: "Not authorized" }, status: :forbidden
    end
  end
end
