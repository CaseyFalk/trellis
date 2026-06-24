# Homebrew formula for the Trellis CLI — TEMPLATE / NOT YET INSTALLABLE.
#
# Blocked on distribution (see docs/REMAINING-WORK.md): the `trellis` CLI and its
# @trellis/core dependency must be published (npm registry or release tarballs)
# before this can resolve. Once published, fill in `url` + `sha256` and test with
#   brew install --build-from-source ./Formula/trellis.rb
class Trellis < Formula
  desc "Scaffold and grow living, captured knowledge bases for learning anything"
  homepage "https://github.com/CaseyFalk/trellis"
  # TODO: point at the published release tarball (or npm pack output) and set sha256.
  url "https://github.com/CaseyFalk/trellis/releases/download/vX.Y.Z/trellis-vX.Y.Z.tgz"
  sha256 "0000000000000000000000000000000000000000000000000000000000000000"
  license "MIT"

  depends_on "node"

  def install
    # Install the CLI and its dependencies into libexec, then link the bin.
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_match "trellis", shell_output("#{bin}/trellis 2>&1", 1)
  end
end
