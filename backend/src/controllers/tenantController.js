const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Video = require('../models/Video');

/**
 * List all tenants (superadmin only)
 */
exports.listTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find().lean();
    res.json({ tenants });
  } catch (err) {
    console.error('listTenants error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get tenant details (counts: editors, viewers, videos)
 * Useful for Super Admin dashboard tenant overview
 */
exports.getTenantDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findById(id).lean();
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    // counts
    const editorsCount = await User.countDocuments({ tenantId: id, role: 'editor' });
    const viewersCount = await User.countDocuments({ tenantId: id, role: 'viewer' });
    const videosCount = await Video.countDocuments({ tenantId: id });

    res.json({
      tenant,
      stats: {
        editors: editorsCount,
        viewers: viewersCount,
        videos: videosCount
      }
    });
  } catch (err) {
    console.error('getTenantDetails error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete tenant and cascade delete users & videos (superadmin only)
 */
exports.deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await Tenant.findById(id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    // Delete users and videos for the tenant
    await User.deleteMany({ tenantId: id });
    await Video.deleteMany({ tenantId: id });

    // Remove tenant
    await Tenant.findByIdAndDelete(id);

    res.json({ message: 'Tenant and related data deleted' });
  } catch (err) {
    console.error('deleteTenant error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
