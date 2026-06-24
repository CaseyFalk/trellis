# Homebrew formula for the Trellis CLI.
#
# Installs from the v0.1.0 GitHub release tarball; `npm install` pulls @trellis/core
# from its release URL (baked into the CLI's package.json). Test locally with:
#   brew install --formula ./Formula/trellis.rb
# For `brew install CaseyFalk/trellis/trellis`, publish this file to a tap repo
# CaseyFalk/homebrew-trellis (see docs/REMAINING-WORK.md).
class Trellis < Formula
  desc "Scaffold and grow living, captured knowledge bases for learning anything"
  homepage "https://github.com/CaseyFalk/trellis"
  url "https://github.com/CaseyFalk/trellis/releases/download/v0.1.0/trellis-0.1.0.tgz"
  sha256 "ef67138e76d2e7bac2719b0f326aa42374a809ca8d4b8def7f52e9ce2590b665"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_match "trellis", shell_output("#{bin}/trellis 2>&1", 1)
  end
end
