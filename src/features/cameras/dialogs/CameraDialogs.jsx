import React from 'react'
import AddCameraDialog from './AddCameraDialog'
import VideoDialog from './VideoDialog'
import DeleteCameraDialog from './DeleteCameraDialog'

const CameraDialogs = ({
  openDialog,
  setOpenDialog,
  cameraUrl,
  setCameraUrl,
  handleAddCamera,
  openVideoDialog,
  cameraForVideo,
  handleCloseVideoDialog,
  openDeleteDialog,
  cameraToDelete,
  setOpenDeleteDialog,
  handleConfirmDeleteCamera,
  setPoint,
  fileError,
}) => {
  return (
    <>
      <AddCameraDialog
        openDialog={openDialog}
        handleDialogClose={() => {
          setOpenDialog(false)
          setPoint(null)
        }}
        cameraUrl={cameraUrl}
        setCameraUrl={setCameraUrl}
        handleAddCamera={handleAddCamera}
        fileError={fileError}
      />

      {openVideoDialog && (
        <VideoDialog
          key={cameraForVideo?.rtspUrl || 'default'}
          open={openVideoDialog}
          onClose={handleCloseVideoDialog}
          camera={cameraForVideo}
        />
      )}

      <DeleteCameraDialog
        open={openDeleteDialog}
        camera={cameraToDelete}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDeleteCamera}
      />
    </>
  )
}

export default CameraDialogs
