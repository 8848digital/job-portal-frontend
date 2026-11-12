import { ProfileInterface } from "@/interfaces/profile-interface";
import { CONSTANTS } from "@/services/config/app-config";
import UploadFileApi from "@/services/api/auth_api/upload_file_api";
import UpdateProfileAPI from "@/services/api/profile_api/update_profile_api";
import { get_access_token } from "@/store/slices/auth_slice/login_slice";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";

const ProfileInfoCard = ({ isLoading, data, error, onRefresh }: ProfileInterface) => {
  console.log("profile@@ data", data);

  // ── Token from Redux (same source as all other API calls in the app) ────────
  const authState = useSelector(get_access_token);
  const token = authState?.token ?? "";

  // ── Update Profile Modal State ─────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);

  // Form fields (pre-filled from current profile data)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  // File upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Pre-fill form whenever profile data loads
  useEffect(() => {
    if (data) {
      setName(data.name ?? "");
      setPhone(data.phone_number ?? "");
      setCity(data.city ?? "");
      setUploadedFileUrl(data.resume ?? "");
    }
  }, [data]);

  const handleOpenModal = () => {
    setSaveSuccess(null);
    setSaveError(null);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (saving) return;
    setShowModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaveError(null);
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setSaveError("Name is required.");
      return;
    }
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      // resumeUrl stays empty unless a new file is uploaded this session
      // — avoids sending a stale/pre-filled URL when user didn't touch the file field
      let resumeUrl = "";

      // Step 1 — upload resume if a new file was selected
      if (selectedFile) {
        const uploadRes = await UploadFileApi({ file: selectedFile });

        // UploadFileApi returns a string on network error
        if (typeof uploadRes === "string") {
          // Show error inside modal, do not close
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          setSaveError(`Resume upload failed: ${uploadRes}`);
          setSaving(false);
          return;
        }

        // Check for API-level error in response body
        const uploadMsg = uploadRes?.data?.message;
        if (uploadMsg?.msg === "error" || uploadMsg?.error) {
          // Show error inside modal, do not close
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          setSaveError(uploadMsg?.error ?? "Resume upload failed.");
          setSaving(false);
          return;
        }

        // Extract file_url from successful response
        resumeUrl = uploadMsg?.file_url ?? "";
      }

      // Step 2 — update profile (only include resume if a new file was uploaded)
      const updateRes = await UpdateProfileAPI(token, {
        name: name.trim(),
        phone_number: phone.trim(),
        city: city.trim(),
        ...(resumeUrl ? { resume: resumeUrl } : {}),
      });

      // Check for API-level error in update response
      if (updateRes?.message?.msg === "error" || updateRes?.message?.error) {
        // Show error inside modal, do not close
        setSaveError(updateRes?.message?.error ?? "Profile update failed.");
        setSaving(false);
        return;
      }

      // Success — show message inside modal, auto-close after 2s
      setSaveSuccess("Profile updated successfully!");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadedFileUrl(resumeUrl);
      setTimeout(() => {
        setShowModal(false);
        setSaveSuccess(null);
        // Re-fetch profile so the sidebar card shows updated data
        onRefresh?.();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      // Show error inside modal, do not close
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSaveError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="bg-white shadow-9 rounded-4">
        {/* ── Top: Avatar + Name ── */}
        <div className="px-5 pt-8 text-center border-bottom border-mercury">
          <a className="mb-4 text-primary" href="#">
            <i className="fas fa-user-circle icon-size"></i>
          </a>
          <h4 className="mb-0">{data?.name1}</h4>
        </div>

        {/* ── Bottom: Contact Info + Actions ── */}
        <div className="px-9 pt-5 pt-xl-6 pb-5">
          <h5 className="text-black-2 mb-8 font-size-5">Contact Info</h5>

          {/* Name */}
          <div className="mb-7">
            <p className="font-size-4 mb-0">Name</p>
            <h5 className="font-size-4 font-weight-semibold mb-0 text-black-2 text-break">
              {data?.name}
            </h5>
          </div>

          {/* Email */}
          <div className="mb-7">
            <p className="font-size-4 mb-0">E-mail</p>
            <h5 className="font-size-4 font-weight-semibold mb-0">
              {data?.email}
            </h5>
          </div>

          {/* Phone */}
          <div className="mb-7">
            <p className="font-size-4 mb-0">Phone</p>
            <h5 className="font-size-4 font-weight-semibold mb-0">
              <a className="text-black-2 text-break" href="">
                {data?.phone_number}
              </a>
            </h5>
          </div>

          {/* Location */}
          <div className="mb-7">
            <p className="font-size-4 mb-0">Location</p>
            <h5 className="font-size-4 font-weight-semibold mb-0 text-black-2 text-break">
              {data?.city}
            </h5>
          </div>

          {/* Actions */}
          <div className="d-flex flex-column gap-5">
            {/* Change Password */}
            <div>
              <Link href="change-password" className="d-block w-100">
                <Button className="rounded-5 py-6 px-5 w-100 mb-2">
                  Change Password
                </Button>
              </Link>
            </div>

            {/* Update Profile */}
            <div>
              <Button
                variant="outline-primary"
                className="rounded-5 py-6 px-5 w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={handleOpenModal}
                style={{ borderWidth: "2px" }}
              >
                <i className="fas fa-user-edit"></i>
                Update Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Update Profile Modal ──────────────────────────────────────────────── */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        backdrop={saving ? "static" : true}
        size="lg"
      >
        <Modal.Header closeButton={!saving}>
          <Modal.Title
            className="font-size-6 font-weight-bold"
            style={{ color: "#1b2d5b" }}
          >
            <i className="fas fa-user-edit mr-2"></i> Update Profile
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="px-8 py-7">
          <Form>
            {/* Name */}
            <Form.Group className="mb-6">
              <Form.Label className="font-size-4 font-weight-semibold text-black-2">
                Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-px-48 rounded-3 font-size-4"
                disabled={saving}
              />
            </Form.Group>

            {/* Phone */}
            <Form.Group className="mb-6">
              <Form.Label className="font-size-4 font-weight-semibold text-black-2">
                Phone Number
              </Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-px-48 rounded-3 font-size-4"
                disabled={saving}
              />
            </Form.Group>

            {/* City */}
            <Form.Group className="mb-6">
              <Form.Label className="font-size-4 font-weight-semibold text-black-2">
                City
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-px-48 rounded-3 font-size-4"
                disabled={saving}
              />
            </Form.Group>

            {/* Resume Upload */}
            <Form.Group className="mb-4">
              <Form.Label className="font-size-4 font-weight-semibold text-black-2">
                Resume{" "}
                <span className="font-size-3 text-gray font-weight-normal">
                  (PDF, DOC, DOCX — max 5 MB)
                </span>
              </Form.Label>

              {/* Current resume link */}
              {uploadedFileUrl && !selectedFile && (
                <div className="mb-3">
                  <a
                    href={`${CONSTANTS.API_BASE_URL}${uploadedFileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-size-3 text-primary"
                  >
                    <i className="fas fa-file-alt mr-1"></i> View current resume
                  </a>
                </div>
              )}

              {/* Upload zone */}
              <div
                className="border rounded-3 text-center py-7 px-5"
                style={{
                  borderColor: "#dfe1e6",
                  background: "#f8f9fb",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
                onClick={() => !saving && fileInputRef.current?.click()}
              >
                <i
                  className="fas fa-cloud-upload-alt mb-2"
                  style={{ fontSize: "1.6rem", color: "#40a87b" }}
                ></i>
                <p className="font-size-4 mb-1 font-weight-semibold text-black-2">
                  {selectedFile ? selectedFile.name : "Click to browse file"}
                </p>
                {selectedFile ? (
                  <p className="font-size-3 text-gray mb-0">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                ) : (
                  <p className="font-size-3 text-gray mb-0">
                    or drag &amp; drop here
                  </p>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </Form.Group>

            {/* Feedback alerts */}
            {saveSuccess && (
              <div className="alert alert-success font-size-4 py-4 mb-0">
                <i className="fas fa-check-circle mr-2"></i>
                {saveSuccess}
              </div>
            )}
            {saveError && (
              <div className="alert alert-danger font-size-4 py-4 mb-0">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {saveError}
              </div>
            )}
          </Form>
        </Modal.Body>

        <Modal.Footer className="px-8 pb-7 pt-0 border-0 d-flex justify-content-end gap-3">
          <Button
            variant="light"
            className="rounded-5 py-5 px-7 font-size-4"
            onClick={handleCloseModal}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            className="rounded-5 py-5 px-7 font-size-4 d-flex align-items-center gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner animation="border" size="sm" />
                Saving…
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Update Profile
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProfileInfoCard;
